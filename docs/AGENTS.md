# AGENTS.md - IoTAgentMesh API Testing Agents Configuration

## Overview

This document defines the AI agent configuration for the IoTAgentMesh API testing project. The agents are designed to work with OpenAI Codex to create, execute, and maintain comprehensive API test suites for IoT mesh networks.

## Agent Definitions

### 1. Repository Analysis Agent

**Agent Name**: `iot-repo-analyzer`
**Primary Function**: Analyze IoTAgentMesh repository structure and extract API definitions
**Mode**: Ask Mode + Code Mode hybrid

```yaml
agent:
  name: iot-repo-analyzer
  description: "Analyzes IoTAgentMesh repository structure, extracts API endpoints, and creates comprehensive documentation"
  capabilities:
    - repository_analysis
    - api_discovery
    - code_documentation
    - dependency_mapping
  tools:
    - github_api
    - ast_parser
    - openapi_extractor
    - documentation_generator
  internet_access: required
  permissions:
    - read_repository
    - access_github_api
    - download_dependencies
    - generate_documentation
```

**Configuration:**
```json
{
  "agent_id": "iot-repo-analyzer",
  "type": "analysis",
  "environment": {
    "github_token": "${GITHUB_TOKEN}",
    "repository": "arilonUK/iotagentmesh",
    "output_format": "structured_json",
    "internet_access": true,
    "proxy_settings": {
      "enabled": false,
      "bypass_list": ["github.com", "api.github.com", "raw.githubusercontent.com"]
    }
  },
  "tasks": [
    "analyze_repository_structure",
    "extract_api_endpoints",
    "identify_data_models",
    "map_dependencies",
    "generate_api_inventory"
  ]
}
```

### 2. Test Strategy Agent

**Agent Name**: `iot-test-strategist`
**Primary Function**: Design comprehensive testing strategies for IoT mesh APIs
**Mode**: Ask Mode

```yaml
agent:
  name: iot-test-strategist
  description: "Creates testing strategies, defines test scenarios, and plans execution approaches"
  capabilities:
    - test_planning
    - strategy_design
    - risk_assessment
    - coverage_analysis
  tools:
    - test_analyzer
    - coverage_calculator
    - risk_assessor
    - strategy_generator
  internet_access: required
  permissions:
    - access_testing_frameworks
    - research_best_practices
    - analyze_industry_standards
```

**Configuration:**
```json
{
  "agent_id": "iot-test-strategist",
  "type": "strategy",
  "environment": {
    "testing_frameworks": ["jest", "supertest", "artillery", "playwright"],
    "iot_protocols": ["mqtt", "coap", "http", "websocket"],
    "internet_access": true,
    "research_sources": [
      "stackoverflow.com",
      "github.com",
      "npmjs.com",
      "iot-testing.org",
      "owasp.org"
    ]
  },
  "objectives": [
    "define_test_categories",
    "create_test_scenarios",
    "plan_execution_strategy",
    "identify_tools_and_frameworks"
  ]
}
```

### 3. Test Implementation Agent

**Agent Name**: `iot-test-implementer`
**Primary Function**: Create actual test code and test harnesses
**Mode**: Code Mode

```yaml
agent:
  name: iot-test-implementer
  description: "Implements test suites, creates test harnesses, and builds automation frameworks"
  capabilities:
    - code_generation
    - test_automation
    - framework_integration
    - ci_cd_setup
  tools:
    - code_generator
    - test_framework
    - automation_builder
    - ci_cd_configurator
  internet_access: required
  permissions:
    - generate_test_code
    - create_configuration_files
    - setup_automation_pipelines
    - install_dependencies
```

**Configuration:**
```json
{
  "agent_id": "iot-test-implementer",
  "type": "implementation",
  "environment": {
    "runtime": "node.js",
    "version": "18.x",
    "package_manager": "npm",
    "internet_access": true,
    "package_sources": [
      "registry.npmjs.org",
      "github.com",
      "cdn.jsdelivr.net"
    ],
    "testing_stack": {
      "unit_testing": "jest",
      "api_testing": "supertest",
      "load_testing": "artillery",
      "e2e_testing": "playwright",
      "mocking": "msw",
      "reporting": "allure"
    }
  },
  "code_standards": {
    "language": "javascript/typescript",
    "style": "airbnb",
    "testing_patterns": "aaa_pattern",
    "documentation": "jsdoc"
  }
}
```

### 4. Performance Testing Agent

**Agent Name**: `iot-performance-tester`
**Primary Function**: Create and execute performance and load tests
**Mode**: Code Mode

```yaml
agent:
  name: iot-performance-tester
  description: "Designs and implements performance tests for IoT mesh networks"
  capabilities:
    - load_testing
    - stress_testing
    - performance_analysis
    - bottleneck_identification
  tools:
    - artillery_js
    - k6_testing
    - performance_analyzer
    - metrics_collector
  internet_access: required
  permissions:
    - execute_load_tests
    - collect_performance_metrics
    - generate_performance_reports
```

**Configuration:**
```json
{
  "agent_id": "iot-performance-tester",
  "type": "performance",
  "environment": {
    "load_testing_tools": ["artillery", "k6", "autocannon"],
    "monitoring_tools": ["prometheus", "grafana"],
    "internet_access": true,
    "performance_targets": {
      "response_time_p95": "200ms",
      "throughput": "1000rps",
      "concurrent_users": "500",
      "error_rate": "<1%"
    }
  },
  "test_scenarios": [
    "baseline_performance",
    "stress_testing",
    "spike_testing",
    "volume_testing",
    "endurance_testing"
  ]
}
```

### 5. Security Testing Agent

**Agent Name**: `iot-security-tester`
**Primary Function**: Implement security tests and vulnerability assessments
**Mode**: Code Mode + Ask Mode

```yaml
agent:
  name: iot-security-tester
  description: "Creates security tests and performs vulnerability assessments for IoT APIs"
  capabilities:
    - security_testing
    - vulnerability_scanning
    - authentication_testing
    - authorization_testing
  tools:
    - owasp_zap
    - security_scanner
    - auth_tester
    - vulnerability_assessor
  internet_access: required
  permissions:
    - run_security_scans
    - test_authentication
    - analyze_vulnerabilities
```

**Configuration:**
```json
{
  "agent_id": "iot-security-tester",
  "type": "security",
  "environment": {
    "security_tools": ["owasp-zap", "snyk", "semgrep"],
    "vulnerability_databases": [
      "cve.mitre.org",
      "nvd.nist.gov",
      "snyk.io/vuln"
    ],
    "internet_access": true,
    "security_standards": ["owasp_top10", "nist_cybersecurity_framework"]
  },
  "test_categories": [
    "authentication_testing",
    "authorization_testing",
    "input_validation",
    "data_encryption",
    "session_management",
    "api_security"
  ]
}
```

### 6. Reporting & Analysis Agent

**Agent Name**: `iot-test-reporter`
**Primary Function**: Generate reports and analyze test results
**Mode**: Ask Mode + Code Mode

```yaml
agent:
  name: iot-test-reporter
  description: "Analyzes test results, generates reports, and provides insights"
  capabilities:
    - result_analysis
    - report_generation
    - trend_analysis
    - insight_generation
  tools:
    - report_generator
    - data_analyzer
    - visualization_tool
    - insight_engine
  internet_access: required
  permissions:
    - access_test_results
    - generate_visualizations
    - create_reports
    - send_notifications
```

**Configuration:**
```json
{
  "agent_id": "iot-test-reporter",
  "type": "reporting",
  "environment": {
    "reporting_tools": ["allure", "junit", "mochawesome"],
    "visualization": ["chartjs", "d3js", "plotly"],
    "internet_access": true,
    "output_formats": ["html", "pdf", "json", "xml"],
    "delivery_methods": ["email", "slack", "teams", "webhook"]
  },
  "report_types": [
    "test_execution_summary",
    "performance_analysis",
    "security_assessment",
    "coverage_report",
    "trend_analysis"
  ]
}
```

## Internet Access Configuration

### Environment Variables

See `.env.example` in the project root for the list of required variables.

```bash
# Internet Access Configuration
export INTERNET_ACCESS_ENABLED=true
export PROXY_ENABLED=false
export DNS_SERVERS="8.8.8.8,1.1.1.1"

# GitHub Access
export GITHUB_TOKEN="your_github_token_here"
export GITHUB_API_URL="https://api.github.com"

# Package Registries
export NPM_REGISTRY="https://registry.npmjs.org"
export PYPI_INDEX_URL="https://pypi.org/simple"

# Security and Performance Tools
export OWASP_ZAP_URL="https://github.com/zaproxy/zaproxy/releases"
export ARTILLERY_REGISTRY="https://registry.npmjs.org"

# Documentation and Research
export RESEARCH_DOMAINS="stackoverflow.com,github.com,npmjs.com,mozilla.org,w3.org"
```

### Network Configuration

```yaml
# network-config.yml
network:
  internet_access:
    enabled: true
    timeout: 30s
    retry_attempts: 3
    
  allowed_domains:
    - "*.github.com"
    - "*.githubusercontent.com"
    - "*.npmjs.org"
    - "*.pypi.org"
    - "*.stackoverflow.com"
    - "*.mozilla.org"
    - "*.w3.org"
    - "*.owasp.org"
    - "*.ietf.org"
    - "*.ieee.org"
    - "cve.mitre.org"
    - "nvd.nist.gov"
    - "snyk.io"
    
  blocked_domains:
    - "*.ads.*"
    - "*.tracking.*"
    - "*.analytics.*"
    
  proxy:
    enabled: false
    # If proxy is needed:
    # http_proxy: "http://proxy.company.com:8080"
    # https_proxy: "https://proxy.company.com:8080"
    # no_proxy: "localhost,127.0.0.1,*.local"
```

### Docker Configuration for Internet Access

```dockerfile
# Dockerfile.agents
FROM node:18-alpine

# Enable internet access
ENV INTERNET_ACCESS_ENABLED=true
ENV NODE_ENV=development

# Install required packages
RUN apk add --no-cache \
    git \
    curl \
    wget \
    python3 \
    py3-pip \
    build-base

# Set up working directory
WORKDIR /app

# Configure npm for internet access
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set strict-ssl true

# Install global tools
RUN npm install -g \
    @artillery/artillery \
    jest \
    typescript \
    @types/node

# Copy agent configurations
COPY agents/ ./agents/
COPY package*.json ./

# Install dependencies
RUN npm ci

# Configure git for repository access
RUN git config --global url."https://github.com/".insteadOf "git@github.com:"

EXPOSE 3000 8080 9090

CMD ["npm", "run", "dev"]
```

### Kubernetes Configuration

```yaml
# k8s-agents-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iot-testing-agents
spec:
  replicas: 3
  selector:
    matchLabels:
      app: iot-testing-agents
  template:
    metadata:
      labels:
        app: iot-testing-agents
    spec:
      containers:
      - name: agents
        image: iot-testing-agents:latest
        env:
        - name: INTERNET_ACCESS_ENABLED
          value: "true"
        - name: GITHUB_TOKEN
          valueFrom:
            secretKeyRef:
              name: github-credentials
              key: token
        ports:
        - containerPort: 3000
        - containerPort: 8080
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
---
apiVersion: v1
kind: Service
metadata:
  name: iot-testing-agents-service
spec:
  selector:
    app: iot-testing-agents
  ports:
  - port: 80
    targetPort: 3000
  - port: 8080
    targetPort: 8080
  type: LoadBalancer
```

### Security Configuration

```yaml
# security-config.yml
security:
  internet_access:
    content_filtering:
      enabled: true
      block_malicious: true
      scan_downloads: true
      
  authentication:
    github:
      token_required: true
      scopes: ["repo", "read:org"]
      
  ssl_verification:
    enabled: true
    verify_certificates: true
    trusted_ca_bundle: "/etc/ssl/certs/ca-certificates.crt"
    
  firewall_rules:
    outbound:
      - allow: "443/tcp to github.com"
      - allow: "443/tcp to api.github.com"
      - allow: "443/tcp to registry.npmjs.org"
      - allow: "53/udp to 8.8.8.8"
      - allow: "53/udp to 1.1.1.1"
      - deny: "all others"
```

## Agent Orchestration

### Main Agent Controller

The following snippet demonstrates a possible implementation of an agent
controller. The file `agent-controller.js` is **not** included in the repository
and would need to be created separately if you want to use this approach.

```javascript
// agent-controller.js (example)
class IoTTestingAgentController {
  constructor() {
    this.agents = new Map();
    this.internetAccess = process.env.INTERNET_ACCESS_ENABLED === 'true';
    this.initializeAgents();
  }

  initializeAgents() {
    // Initialize all agents with internet access
    const agents = [
      'iot-repo-analyzer',
      'iot-test-strategist', 
      'iot-test-implementer',
      'iot-performance-tester',
      'iot-security-tester',
      'iot-test-reporter'
    ];

    agents.forEach(agentId => {
      this.agents.set(agentId, new Agent({
        id: agentId,
        internetAccess: this.internetAccess,
        configPath: `./agents/${agentId}/config.json`
      }));
    });
  }

  async executeTestPipeline() {
    try {
      // Phase 1: Repository Analysis
      const repoAnalysis = await this.agents.get('iot-repo-analyzer').analyze();
      
      // Phase 2: Test Strategy
      const strategy = await this.agents.get('iot-test-strategist').createStrategy(repoAnalysis);
      
      // Phase 3: Test Implementation
      const testSuite = await this.agents.get('iot-test-implementer').implement(strategy);
      
      // Phase 4: Performance Testing
      const perfResults = await this.agents.get('iot-performance-tester').execute(testSuite);
      
      // Phase 5: Security Testing
      const secResults = await this.agents.get('iot-security-tester').execute(testSuite);
      
      // Phase 6: Reporting
      const report = await this.agents.get('iot-test-reporter').generate({
        repoAnalysis,
        strategy,
        testSuite,
        perfResults,
        secResults
      });

      return report;
    } catch (error) {
      console.error('Agent pipeline execution failed:', error);
      throw error;
    }
  }
}

module.exports = IoTTestingAgentController;
```

## Usage Instructions

### 1. Environment Setup

```bash
# Clone the configuration
git clone https://github.com/your-org/iot-testing-agents.git
cd iot-testing-agents

# Set environment variables
cp .env.example .env
# Edit .env with your Supabase keys and other required values

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 2. Development Scripts

The previous version of this document referenced several commands such as `npm run agents:init` and `npm run pipeline:execute`. These scripts are not included in the repository. The available npm scripts are:

```bash
npm run dev          # start the Vite development server
npm run build        # build the production bundle  
npm run lint         # run ESLint on the project
npm run preview      # preview the production build
npm test             # run tests with vitest
npm run test:watch   # run tests in watch mode
npm run test:coverage # run tests with coverage report
```

This configuration ensures the project can be installed and developed locally using the standard scripts above.
