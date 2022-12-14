import * as cw_sdk from "@aws-sdk/client-cloudwatch";

interface CreateCloudWatchAlarmProps {
    AlarmName: string,
    Region: string,
    SnsTopics: string[]
}

interface MetricDataQueryProps {
    MetricFor: '4XX' | '5XX',
    Threshold: string,
    TargetGroupFullName: string,
    LoadBalancerFullName: string,
}

export async function createCloudWatchAlarm(props: CreateCloudWatchAlarmProps & MetricDataQueryProps) {
    const cw_client = new cw_sdk.CloudWatchClient({
        region: props.Region,
    });

    try {
        const metricDataQuery: cw_sdk.MetricDataQuery[] = await generateMetricDataQuery({
            MetricFor: props.MetricFor,
            Threshold: props.Threshold,
            LoadBalancerFullName: props.LoadBalancerFullName,
            TargetGroupFullName: props.TargetGroupFullName,
        });

        await cw_client.send(
            new cw_sdk.PutMetricAlarmCommand({
                AlarmName: props.AlarmName,
                ComparisonOperator: cw_sdk.ComparisonOperator.GreaterThanOrEqualToThreshold,
                Threshold: 5,
                EvaluationPeriods: 1,
                Metrics: metricDataQuery,
                OKActions: props.SnsTopics,
                AlarmActions: props.SnsTopics
            })
        );
    } catch (error) {
        console.log(error);
    }
}

async function generateMetricDataQuery(props: MetricDataQueryProps): Promise<cw_sdk.MetricDataQuery[]> {
    const metricDataQuery: cw_sdk.MetricDataQuery[] = [
        {
            Id: 'e1',
            Expression: '(m2 / m1) * 100',
            Label: `${props.MetricFor} Rate`
        },
        {
            Id: 'm1',
            Label: 'Request Count',
            MetricStat: {
                Metric: {
                    Namespace: 'AWS/ApplicationELB',
                    MetricName: 'RequestCount',
                    Dimensions: [
                        {
                            Name: 'LoadBalancer',
                            Value: props.LoadBalancerFullName
                        },
                        {
                            Name: 'TargetGroup',
                            Value: props.TargetGroupFullName
                        }
                    ]
                },
                Period: 300,
                Stat: 'Sum'
            },
            ReturnData: false
        },
        {
            Id: 'm2',
            Label: `${props.MetricFor} Count`,
            MetricStat: {
                Metric: {
                    Namespace: 'AWS/ApplicationELB',
                    MetricName: `HTTPCode_Target_${props.MetricFor}_Count`,
                    Dimensions: [
                        {
                            Name: 'LoadBalancer',
                            Value: props.LoadBalancerFullName
                        },
                        {
                            Name: 'TargetGroup',
                            Value: props.TargetGroupFullName
                        }
                    ]
                },
                Period: 300,
                Stat: 'Sum'
            },
            ReturnData: false
        }
    ];

    return metricDataQuery;
}
