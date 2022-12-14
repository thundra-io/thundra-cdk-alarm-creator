import * as cw_sdk from "@aws-sdk/client-cloudwatch";

const cw_client = new cw_sdk.CloudWatchClient({});

interface DeleteCloudWatchAlarmProps {
    AlarmNames: string[],
}

export async function deleteCloudWatchAlarms(props: DeleteCloudWatchAlarmProps) {
    try {
        await cw_client.send(
            new cw_sdk.DeleteAlarmsCommand({
                AlarmNames: props.AlarmNames
            })
        );
    } catch (error) {
        console.log(error);
    }
}
