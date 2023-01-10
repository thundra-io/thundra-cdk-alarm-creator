import * as arn_parser from "@aws-sdk/util-arn-parser";

import { CloudFormationCustomResourceCreateEvent, CloudFormationCustomResourceUpdateEvent } from 'aws-lambda';
import { v4 } from 'uuid';
import { CustomResourceHandler } from '../base';
import { createCloudWatchAlarm } from "../utils/create-cloudwatch-alarm";
import { findTargetGroup } from '../utils/find-target-group';

export class CloudWatchAlarmCreateHandler extends CustomResourceHandler<CloudFormationCustomResourceCreateEvent | CloudFormationCustomResourceUpdateEvent> {
    public async consumeEvent() {
        const props = this.event.ResourceProperties;
        const physicalResourceId = v4();

        const targetGroupArn = await findTargetGroup(`${props.ApplicationName}-${props.Stage}`, props.Region);
        const targetGroupFullName = arn_parser.parse(targetGroupArn!).resource;
        const loadBalancerFullName = arn_parser.parse(props.LoadBalancerArn).resource.replace('loadbalancer/', '');

        await createCloudWatchAlarm({
            AlarmName: `${props.ApplicationName}-4xx-alarm-${props.Stage}`,
            Region: props.Region,
            MetricFor: '4XX',
            Threshold: props.Threshold4xx,
            RequestCountThreshold: props.RequestCountThreshold4xx,
            TargetGroupFullName: targetGroupFullName,
            LoadBalancerFullName: loadBalancerFullName,
            SnsTopics: props.SnsTopics
        });

        await createCloudWatchAlarm({
            AlarmName: `${props.ApplicationName}-5xx-alarm-${props.Stage}`,
            Region: props.Region,
            MetricFor: '5XX',
            Threshold: props.Threshold5xx,
            RequestCountThreshold: props.RequestCountThreshold5xx,
            TargetGroupFullName: targetGroupFullName,
            LoadBalancerFullName: loadBalancerFullName,
            SnsTopics: props.SnsTopics
        });

        return {
            physicalResourceId: physicalResourceId,
            data: {},
        };
    }
}
