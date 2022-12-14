import { CloudFormationCustomResourceDeleteEvent } from 'aws-lambda';
import { CustomResourceHandler } from '../base';
import { deleteCloudWatchAlarms } from "../utils/delete-cloudwatch-alarms";

export class CloudWatchAlarmDeleteHandler extends CustomResourceHandler<CloudFormationCustomResourceDeleteEvent> {
    public async consumeEvent() {
        const props = this.event.ResourceProperties;

        await deleteCloudWatchAlarms({
            AlarmNames: [
                `${props.ApplicationName}-4xx-alarm-${props.Stage}`,
                `${props.ApplicationName}-5xx-alarm-${props.Stage}`
            ]
        });

        return {
            physicalResourceId: this.event.PhysicalResourceId,
            data: {},
        };
    }
}
