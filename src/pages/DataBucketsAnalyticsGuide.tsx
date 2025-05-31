
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  BarChart3, 
  Settings, 
  Activity, 
  TrendingUp, 
  Filter, 
  Download,
  Calendar,
  Gauge,
  LineChart,
  ExternalLink,
  ArrowLeft,
  Server,
  Cloud
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DataBucketsAnalyticsGuide = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'overview',
      title: 'Data Buckets & Analytics Overview',
      icon: Database,
      content: [
        'Data buckets are the foundation of data management in our IoT platform, providing structured storage for device data with configurable retention and analytics capabilities.',
        'Analytics tools help you transform raw sensor data into actionable insights through visualization, trend analysis, and automated reporting.',
        'The system supports multiple storage backends and real-time data processing for immediate insights and historical analysis.'
      ]
    },
    {
      id: 'creating-buckets',
      title: 'Creating Data Buckets',
      icon: Settings,
      content: [
        'Data buckets define how your device data is collected, stored, and organized for analysis.',
        'Each bucket is configured for specific data types and can be customized with retention policies and storage backends.',
        'Buckets can be associated with individual devices or device groups for scalable data management.'
      ],
      steps: [
        'Navigate to Data Buckets in your dashboard',
        'Click "New Data Bucket" to open the configuration form',
        'Enter bucket name and description for easy identification',
        'Select the target device or device group',
        'Choose the data reading type (temperature, humidity, etc.)',
        'Configure storage backend (PostgreSQL or AWS S3)',
        'Set retention period and sampling interval',
        'Save the bucket to start collecting data'
      ]
    },
    {
      id: 'storage-backends',
      title: 'Storage Backend Options',
      icon: Server,
      content: [
        'Choose the right storage backend based on your data volume, access patterns, and cost requirements.',
        'PostgreSQL offers fast queries and real-time analytics, while S3 provides cost-effective long-term storage.',
        'Hybrid approaches can combine both backends for optimal performance and cost efficiency.'
      ],
      backendTypes: [
        {
          name: 'PostgreSQL',
          description: 'High-performance relational database for real-time analytics',
          benefits: ['Fast queries', 'Real-time processing', 'Complex analytics', 'ACID compliance'],
          useCases: 'Recent data, dashboards, real-time alerts'
        },
        {
          name: 'AWS S3',
          description: 'Scalable object storage for long-term data retention',
          benefits: ['Cost-effective', 'Unlimited scale', 'Data archiving', 'Backup/restore'],
          useCases: 'Historical data, compliance, data lakes'
        }
      ]
    },
    {
      id: 'data-visualization',
      title: 'Data Visualization & Charts',
      icon: BarChart3,
      content: [
        'Transform your IoT data into meaningful visualizations with multiple chart types and customization options.',
        'Interactive dashboards provide real-time insights and historical trend analysis.',
        'Charts can be embedded in custom dashboards or exported for reporting purposes.'
      ],
      chartTypes: [
        'Line charts for time-series data and trends',
        'Bar charts for comparing values across categories',
        'Area charts for cumulative data visualization',
        'Scatter plots for correlation analysis',
        'Gauge charts for real-time status monitoring',
        'Heatmaps for pattern recognition'
      ]
    },
    {
      id: 'analytics-features',
      title: 'Advanced Analytics Features',
      icon: TrendingUp,
      content: [
        'Built-in analytics tools help you discover patterns, detect anomalies, and predict future trends.',
        'Statistical functions and aggregations provide deep insights into device performance and behavior.',
        'Machine learning capabilities can identify patterns and predict maintenance needs.'
      ],
      features: [
        'Statistical aggregations (min, max, avg, sum, count)',
        'Time-based grouping and windowing functions',
        'Trend analysis and forecasting capabilities',
        'Anomaly detection and alerting',
        'Correlation analysis between sensors',
        'Data quality assessment and validation'
      ]
    },
    {
      id: 'data-filtering',
      title: 'Data Filtering & Queries',
      icon: Filter,
      content: [
        'Powerful filtering capabilities help you focus on specific data subsets and time ranges.',
        'Custom queries allow for complex data analysis and report generation.',
        'Saved filters can be reused for consistent analysis across different time periods.'
      ],
      filterOptions: [
        'Time range selection (hours, days, weeks, months)',
        'Device-specific filtering by ID or group',
        'Value-based filtering with comparison operators',
        'Data quality filters (valid readings only)',
        'Custom SQL queries for advanced analysis',
        'Saved filter templates for repeated use'
      ]
    },
    {
      id: 'data-export',
      title: 'Data Export & Reporting',
      icon: Download,
      content: [
        'Export capabilities allow you to use your data in external tools and generate custom reports.',
        'Multiple export formats support different use cases from spreadsheet analysis to data science workflows.',
        'Automated reports can be scheduled for regular delivery to stakeholders.'
      ],
      exportFormats: [
        'CSV for spreadsheet applications',
        'JSON for API integrations',
        'PDF for formatted reports',
        'Excel for business analysis',
        'Parquet for big data analytics',
        'Real-time API endpoints'
      ]
    },
    {
      id: 'retention-policies',
      title: 'Data Retention & Lifecycle',
      icon: Calendar,
      content: [
        'Data retention policies help manage storage costs while ensuring compliance with data governance requirements.',
        'Automated lifecycle management moves data between storage tiers based on age and access patterns.',
        'Backup and archival features protect against data loss and support long-term preservation.'
      ],
      retentionFeatures: [
        'Configurable retention periods by bucket',
        'Automatic data archival to cold storage',
        'Data compression for space efficiency',
        'Backup and disaster recovery options',
        'Compliance with data governance policies',
        'Audit trails for data lifecycle events'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Create Data Bucket',
      description: 'Set up a new bucket to start collecting device data',
      action: 'Go to Data Buckets',
      icon: Database,
      link: '/dashboard/data-buckets'
    },
    {
      title: 'View Analytics Dashboard',
      description: 'Explore your data with interactive charts and insights',
      action: 'Open Dashboard',
      icon: BarChart3,
      link: '/dashboard'
    },
    {
      title: 'Configure Devices',
      description: 'Set up devices to send data to your buckets',
      action: 'Manage Devices',
      icon: Activity,
      link: '/dashboard/devices'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/documentation')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documentation
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Data Buckets & Analytics Guide</h1>
          <p className="text-muted-foreground">
            Store, analyze, and visualize your IoT data effectively
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">Data Management</Badge>
            <span className="text-sm text-muted-foreground">8 min read</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump to common data management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <action.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm">{action.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(action.link)}
                  >
                    {action.action}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guide Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={section.id} id={section.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <section.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                {section.steps && (
                  <div>
                    <h4 className="font-semibold mb-3">Step-by-step Process:</h4>
                    <ol className="space-y-2">
                      {section.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold mt-0.5">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {section.backendTypes && (
                  <div>
                    <h4 className="font-semibold mb-3">Storage Backend Comparison:</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {section.backendTypes.map((backend, bIndex) => (
                        <div key={bIndex} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {backend.name === 'PostgreSQL' ? (
                              <Server className="h-5 w-5 text-primary" />
                            ) : (
                              <Cloud className="h-5 w-5 text-primary" />
                            )}
                            <h5 className="font-medium">{backend.name}</h5>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{backend.description}</p>
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium">Benefits:</span>
                              <ul className="text-xs text-muted-foreground mt-1">
                                {backend.benefits.map((benefit, benefitIndex) => (
                                  <li key={benefitIndex} className="flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="text-xs font-medium">Best for:</span>
                              <p className="text-xs text-muted-foreground">{backend.useCases}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.chartTypes && (
                  <div>
                    <h4 className="font-semibold mb-3">Available Chart Types:</h4>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {section.chartTypes.map((chart, cIndex) => (
                        <li key={cIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <LineChart className="h-3 w-3 text-primary flex-shrink-0" />
                          {chart}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.features && (
                  <div>
                    <h4 className="font-semibold mb-3">Key Features:</h4>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {section.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.filterOptions && (
                  <div>
                    <h4 className="font-semibold mb-3">Filtering Options:</h4>
                    <ul className="grid gap-2">
                      {section.filterOptions.map((option, oIndex) => (
                        <li key={oIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Filter className="h-3 w-3 text-primary flex-shrink-0" />
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.exportFormats && (
                  <div>
                    <h4 className="font-semibold mb-3">Export Formats:</h4>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {section.exportFormats.map((format, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Download className="h-3 w-3 text-primary flex-shrink-0" />
                          {format}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.retentionFeatures && (
                  <div>
                    <h4 className="font-semibold mb-3">Retention Features:</h4>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {section.retentionFeatures.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            {index < sections.length - 1 && <Separator className="my-8" />}
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Continue your journey with these related guides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Device Management</div>
                  <div className="text-xs text-muted-foreground">Connect and manage your IoT devices</div>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <Gauge className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Alarm Configuration</div>
                  <div className="text-xs text-muted-foreground">Set up alerts and notifications</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataBucketsAnalyticsGuide;
