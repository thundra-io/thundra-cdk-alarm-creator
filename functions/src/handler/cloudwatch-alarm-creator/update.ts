import * as _ from 'lodash';

import { CloudFormationCustomResourceUpdateEvent } from 'aws-lambda';
import { CustomResourceHandler } from '../base';
import { deleteCloudWatchAlarms } from '../utils/delete-cloudwatch-alarms';
import { CloudWatchAlarmCreateHandler } from './create';

export class CloudWatchAlarmUpdateHandler extends CustomResourceHandler<CloudFormationCustomResourceUpdateEvent> {
    public async consumeEvent() {
        const props = this.event.ResourceProperties;
        const oldProps = this.event.OldResourceProperties;

        if (_.isEqual(oldProps, props)) {
            // No op
        } else {
            if ((oldProps.ApplicationName === props.ApplicationName) && (oldProps.Stage === props.Stage)) {
                const createHandler = new CloudWatchAlarmCreateHandler(this.event);
                const _createResponse = await createHandler.consumeEvent();
            } else {
                await deleteCloudWatchAlarms({
                    AlarmNames: [
                        `${oldProps.ApplicationName}-4xx-alarm-${oldProps.Stage}`,
                        `${oldProps.ApplicationName}-5xx-alarm-${oldProps.Stage}`
                    ]
                });

                const createHandler = new CloudWatchAlarmCreateHandler(this.event);
                const _createResponse = await createHandler.consumeEvent();
            }
        }

        return {
            physicalResourceId: this.event.PhysicalResourceId,
            data: {},
        };
    }
}
