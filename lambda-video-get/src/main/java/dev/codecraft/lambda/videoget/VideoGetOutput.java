package dev.codecraft.lambda.videoget;

import dev.codecraft.models.mappings.VideoRecordResource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VideoGetOutput {
    private String userId;

    private List<VideoRecordResource> records;

}
