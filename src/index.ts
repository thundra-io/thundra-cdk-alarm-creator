import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as log from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

import { Construct } from 'constructs';

export interface CloudWatchAlarmCreatorProps {
    readonly prefix?: string;
    readonly postfix?: string;
    readonly applicationName: string;
    readonly stage: string;
    readonly elbArn: string;
    readonly threshold4xx: number,
    readonly requestCountThreshold4xx: number,
    readonly threshold5xx: number,
    readonly requestCountThreshold5xx: number,
    readonly alarmTopics: string[];
}

export class CloudWatchAlarmCreator extends Construct {
    private readonly prefix?: string;
    private readonly postfix?: string;
    private readonly cloudWatchAlarmFunction: lambda.Function;
    private readonly cloudWatchAlarmProvider: cr.Provider;

    constructor(scope: Construct, id: string, props: CloudWatchAlarmCreatorProps) {
        super(scope, id);
        this.prefix = props.prefix || '';
        this.postfix = props.postfix || '';

        this.cloudWatchAlarmFunction = new lambda.Function(this, `${this.prefix}alarms-cr-function${this.postfix}`, {
            functionName: `${this.prefix}alarms-cr-function${this.postfix}`,
            code: lambda.Code.fromAsset(path.join(__dirname, "functions")),
            handler: "index.handler",
            runtime: lambda.Runtime.NODEJS_18_X,
            memorySize: 512,
            timeout: cdk.Duration.minutes(1),
            logRetention: log.RetentionDays.ONE_DAY,
            retryAttempts: 0,
            initialPolicy: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        "cloudwatch:*",
                    ],
                    resources: [
                        "*"
                    ]
                }),
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                        "elasticloadbalancing:Describe*",
                    ],
                    resources: [
                        "*"
                    ]
                }),
            ],
        });

        this.cloudWatchAlarmProvider = new cr.Provider(this, `${this.prefix}alarms-cr-provider${this.postfix}`, {
            onEventHandler: this.cloudWatchAlarmFunction,
            providerFunctionName: `${this.prefix}alarms-cr-provider${this.postfix}`
        });

        new cdk.CustomResource(this, `${this.prefix}alarms-cr-construct${this.postfix}`, {
            serviceToken: this.cloudWatchAlarmProvider.serviceToken,
            properties: {
                ApplicationName: props.applicationName,
                LoadBalancerArn: props.elbArn,
                Stage: props.stage,
                Region: cdk.Stack.of(this).region,
                SnsTopics: props.alarmTopics,
                Threshold4xx: props.threshold4xx,
                RequestCountThreshold4xx: props.requestCountThreshold4xx,
                Threshold5xx: props.threshold5xx,
                RequestCountThreshold5xx: props.requestCountThreshold5xx,
            }
        });
    }
}
