# API Documentation v2.0.0
*Last updated: 09/01/2025*

## API Information
Essential information for integrating with our IoT platform API

### Base URL
```
https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-gateway
```

### Alternative Direct Endpoints
```
https://tuevghmlxosxuszxjral.supabase.co/functions/v1/api-devices
```

## Authentication

The API supports two authentication methods:

### 1. JWT Authentication (Session-based)
For user session-based access via web/mobile applications
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. API Key Authentication
For programmatic access with scoped permissions
```
Authorization: Bearer iot_xxxxxxxx...
```

**Required Scopes for Device Operations:**
- `devices` - Full device management
- `read` - Read-only access
- `write` - Create/update access

## Rate Limiting
Rate limit headers included in all responses:
- API Gateway: Standard rate limits per organization
- API Keys: Scoped rate limits based on subscription plan

---

## Devices API

Device management operations with organization-scoped access.

### List All Devices
**GET** `/api/devices`

Retrieve all devices for the authenticated organization.

#### Response Formats

**API Gateway Response:**
```json
{
  "success": true,
  "devices": [
    {
      "id": "uuid",
      "name": "Device Name",
      "type": "sensor",
      "status": "online|offline|warning",
      "organization_id": "uuid",
      "description": "Device description",
      "product_template_id": "uuid",
      "last_active_at": "2025-01-09T10:30:00Z"
    }
  ]
}
```

**Direct Edge Function Response:**
```json
[
  {
    "id": "uuid",
    "name": "Device Name",
    "type": "sensor",
    "status": "online|offline|warning",
    "organization_id": "uuid",
    "description": "Device description",
    "product_template_id": "uuid",
    "last_active_at": "2025-01-09T10:30:00Z"
  }
]
```

#### Status Codes
- **200** - Devices retrieved successfully
- **400** - No organization ID found
- **401** - Missing or invalid authentication
- **403** - User not associated with organization
- **500** - Database or internal server error

---

### Get Device by ID
**GET** `/api/devices/{deviceId}`

Retrieve a specific device by its ID.

#### Parameters
- `deviceId` (path, required) - UUID of the device

#### Response Format
**API Gateway:**
```json
{
  "success": true,
  "device": {
    "id": "uuid",
    "name": "Device Name",
    "type": "sensor",
    "status": "online",
    "organization_id": "uuid",
    "description": "Device description",
    "product_template_id": "uuid",
    "last_active_at": "2025-01-09T10:30:00Z"
  }
}
```

**Direct Edge Function:**
```json
{
  "id": "uuid",
  "name": "Device Name",
  "type": "sensor",
  "status": "online",
  "organization_id": "uuid",
  "description": "Device description",
  "product_template_id": "uuid",
  "last_active_at": "2025-01-09T10:30:00Z"
}
```

#### Status Codes
- **200** - Device retrieved successfully
- **400** - Invalid device ID format
- **401** - Missing or invalid authentication
- **403** - User not associated with organization
- **404** - Device not found or not accessible
- **500** - Database or internal server error

---

### Create New Device
**POST** `/api/devices`

Create a new device in the organization.

#### Request Body
```json
{
  "name": "Device Name",           // required
  "type": "sensor",                // required  
  "status": "offline",             // optional, defaults to "offline"
  "description": "Description",    // optional
  "product_template_id": "uuid"    // optional
}
```

#### Response Format
**API Gateway:**
```json
{
  "success": true,
  "device": {
    "id": "uuid",
    "name": "Device Name",
    "type": "sensor",
    "status": "offline",
    "organization_id": "uuid",
    "description": "Description",
    "product_template_id": "uuid",
    "last_active_at": "2025-01-09T10:30:00Z"
  }
}
```

**Direct Edge Function:**
```json
{
  "id": "uuid",
  "name": "Device Name",
  "type": "sensor",
  "status": "offline",
  "organization_id": "uuid",
  "description": "Description",
  "product_template_id": "uuid",
  "last_active_at": "2025-01-09T10:30:00Z"
}
```

#### Status Codes
- **201** - Device created successfully
- **400** - Missing required fields (name, type) or validation error
- **401** - Missing or invalid authentication
- **403** - User not associated with organization
- **500** - Database or internal server error

---

### Update Device
**PUT** `/api/devices/{deviceId}`

Update an existing device.

#### Parameters
- `deviceId` (path, required) - UUID of the device to update

#### Request Body
```json
{
  "name": "Updated Name",          // optional
  "type": "updated_type",          // optional
  "status": "online",              // optional
  "description": "New description", // optional
  "product_template_id": "uuid"    // optional
}
```

#### Response Format
Same as Get Device by ID responses.

#### Status Codes
- **200** - Device updated successfully
- **400** - Invalid device ID or request data
- **401** - Missing or invalid authentication
- **403** - User not associated with organization
- **404** - Device not found or not accessible
- **500** - Database or internal server error

---

### Delete Device
**DELETE** `/api/devices/{deviceId}`

Delete a device from the organization.

#### Parameters
- `deviceId` (path, required) - UUID of the device to delete

#### Response Format
**API Gateway:**
```json
{
  "success": true
}
```

**Direct Edge Function:**
```json
{
  "message": "Device deleted successfully"
}
```

#### Status Codes
- **200** - Device deleted successfully
- **401** - Missing or invalid authentication
- **403** - User not associated with organization
- **404** - Device not found or not accessible
- **500** - Database or internal server error

---

## Error Response Formats

### API Gateway Errors
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Direct Edge Function Errors
```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

### Common Error Cases
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User not associated with any organization or insufficient permissions
- **404 Not Found**: Resource not found or not accessible by the user's organization
- **400 Bad Request**: Invalid request format, missing required fields, or validation errors
- **500 Internal Server Error**: Database errors or unexpected server issues

---

## Implementation Notes

### Database Access
- Uses Supabase RLS-bypassing functions for data operations
- Organization-scoped access enforced at the database level
- Functions used: `get_devices_by_org_id`, `create_device_bypass_rls`, `update_device_bypass_rls`, `delete_device_bypass_rls`

### CORS Support
All endpoints support CORS with the following headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Authentication Flow
1. Extract Authorization header
2. Determine authentication type (JWT vs API Key)
3. Validate credentials with Supabase
4. Retrieve user's organization context
5. Enforce organization-scoped access

This documentation reflects the actual dual-implementation architecture with both API Gateway and direct Edge Function endpoints, accurate response formats, proper error handling, and the sophisticated authentication system implemented in the codebase.

---

## Download Links

- [Postman Collection](javascript:void(0)) - Import this collection to test the API
- [Interactive Docs](javascript:void(0)) - Explore the API with live examples

---

*For support or questions about the API, please contact our development team or create an issue in the project repository.*