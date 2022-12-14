import * as elbv2_sdk from "@aws-sdk/client-elastic-load-balancing-v2";

export async function findTargetGroup(applicationName: string, region: string): Promise<string | undefined> {
    const elbv2_client = new elbv2_sdk.ElasticLoadBalancingV2({
        region: region,
    });

    let foresightApiBackendTargetGroupArn: string | undefined;

    let nextMarker: string | undefined = undefined;
    let nextPage: boolean = true;

    try {
        while (nextPage) {
            const output: elbv2_sdk.DescribeTargetGroupsCommandOutput = await elbv2_client.send(
                new elbv2_sdk.DescribeTargetGroupsCommand({
                    PageSize: 25,
                    Marker: nextMarker,
                })
            );

            // !! to typecast to boolean
            nextPage = !!output.NextMarker;
            nextMarker = output.NextMarker;

            for (const targetGroup of output.TargetGroups!) {
                const targetGroupArn = targetGroup.TargetGroupArn?.toString();

                const targetGroupDetails = await elbv2_client.send(
                    new elbv2_sdk.DescribeTagsCommand({
                        ResourceArns: [
                            targetGroupArn!
                        ]
                    })
                );

                for (const tagDescription of targetGroupDetails.TagDescriptions!) {
                    for (const tag of tagDescription.Tags!) {
                        if (tag.Key === 'elasticbeanstalk:environment-name' && tag.Value === applicationName) {
                            console.log(`Found: ${targetGroupArn}`);
                            foresightApiBackendTargetGroupArn = targetGroupArn;
                            nextPage = false;
                            break;
                        }
                    }
                }
            }
        }

        return foresightApiBackendTargetGroupArn;
    } catch (error) {
        console.log(error)
        return undefined;
    }
}
