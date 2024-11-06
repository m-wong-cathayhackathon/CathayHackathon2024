package dev.codecraft.lambda.videoget;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import dev.codecraft.models.VideoRecord;
import dev.codecraft.models.mappings.ComprehendResource;
import dev.codecraft.models.mappings.TranscribeResource;
import dev.codecraft.models.mappings.VideoRecordResource;
import dev.codecraft.states.VideoRecordState;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;
import software.amazon.awssdk.services.comprehend.ComprehendClient;
import software.amazon.awssdk.services.comprehend.model.DescribeEntitiesDetectionJobRequest;
import software.amazon.awssdk.services.comprehend.model.DescribeEntitiesDetectionJobResponse;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.transcribe.TranscribeClient;
import software.amazon.awssdk.services.transcribe.model.GetTranscriptionJobRequest;
import software.amazon.awssdk.services.transcribe.model.GetTranscriptionJobResponse;
import software.amazon.awssdk.services.transcribe.model.TranscriptionJob;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.LinkedList;

public class VideoGetHandler implements RequestHandler<VideoGetInput, VideoGetOutput> {

    private final DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
            .dynamoDbClient(DynamoDbClient.create())
            .build();

    private final TableSchema<VideoRecord> videoRecordTableSchema = TableSchema.fromClass(VideoRecord.class);
    private final DynamoDbTable<VideoRecord> dynamoDbTable = dynamoDbEnhancedClient
            .table(VideoRecord.TABLE_NAME, videoRecordTableSchema);

    private final TranscribeClient transcribeClient = TranscribeClient.builder().build();
    private final ComprehendClient comprehendClient = ComprehendClient.builder().build();

    @Override
    public VideoGetOutput handleRequest(VideoGetInput input, Context context) {
        PageIterable<VideoRecord> records = dynamoDbTable.query(QueryEnhancedRequest.builder()
                .queryConditional(QueryConditional.keyEqualTo(k -> k.partitionValue(input.getUserId())))
                .filterExpression(Expression.builder()
                        .expression("attribute_exists(video_status) AND video_status <> :video_status")
                        .putExpressionValue(":video_status", AttributeValue.fromS(VideoRecordState.DELETED.toString())).build()
                ).build());

        LinkedList<VideoRecordResource> videoRecordResources = new LinkedList<>();

        records.stream().forEach(page ->
                page.items().forEach(item -> {
                    TranscribeResource transcribeResource = null;
                    ComprehendResource comprehendResource = null;

                    switch (item.getVideoStatus()) {
                        case TRANSCRIPTION_STARTED:
                            GetTranscriptionJobRequest getTranscriptionJobRequest = GetTranscriptionJobRequest.builder()
                                    .transcriptionJobName(item.getTranscriptionJobName())
                                    .build();
                            GetTranscriptionJobResponse res = transcribeClient.getTranscriptionJob(getTranscriptionJobRequest);
                            TranscriptionJob job = res.transcriptionJob();

                            String creationTimeStr = job.creationTime() != null ? LocalDateTime.ofInstant(job.creationTime(), ZoneOffset.UTC).toString() : null;
                            String completionTimeStr = job.completionTime() != null ? LocalDateTime.ofInstant(job.completionTime(), ZoneOffset.UTC).toString() : null;

                            transcribeResource = TranscribeResource.builder()
                                    .creationTime(creationTimeStr)
                                    .completionTime(completionTimeStr)
                                    .status(job.transcriptionJobStatusAsString())
                                    .languageCode(job.languageCodeAsString())
                                    .failureReason(job.failureReason())
                                    .build();
                            break;
                        case COMPREHEND_STARTED:
                            DescribeEntitiesDetectionJobResponse comprehendJobRes = comprehendClient
                                    .describeEntitiesDetectionJob(DescribeEntitiesDetectionJobRequest
                                            .builder()
                                            .jobId(item.getComprehendJobName())
                                            .build()
                                    );
                            comprehendResource = ComprehendResource.builder()
                                    .jobId(comprehendJobRes.entitiesDetectionJobProperties().jobId())
                                    .jobName(comprehendJobRes.entitiesDetectionJobProperties().jobName())
                                    .jobStatus(comprehendJobRes.entitiesDetectionJobProperties().jobStatusAsString())
                                    .build();
                        default:
                            break;
                    }

                    videoRecordResources.add(VideoRecordResource.fromVideoRecord(item, transcribeResource, comprehendResource));
                })
        );

        return VideoGetOutput.builder()
                .userId(input.getUserId())
                .records(videoRecordResources)
                .build();
    }

}
