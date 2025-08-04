# Implementation Plan

- [x] 1. Set up Microsoft Graph API integration infrastructure
  - Create OAuth token management service for Microsoft Graph authentication
  - Implement secure credential storage using environment variables
  - Write token refresh mechanism with error handling
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 2. Create calendar service layer
  - [x] 2.1 Implement Microsoft Graph calendar API client
    - Write GraphApiClient class with authentication headers
    - Implement createCalendarEvent method with proper error handling
    - Add request/response logging and monitoring
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 2.2 Build business hours validation service
    - Create BusinessHoursValidator class with timezone support
    - Implement isValidBusinessDay and isValidBusinessTime methods
    - Add Europe/Paris timezone handling for Monday-Friday 14:00-16:30
    - Write unit tests for edge cases and timezone conversions
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Enhance contact form with appointment booking UI
  - [x] 3.1 Create appointment date/time picker component
    - Build DateTimePicker component with business hours constraints
    - Implement calendar widget showing only available weekdays
    - Add time slot selection with 30-minute intervals (14:00-16:30)
    - Include timezone display and validation feedback
    - _Requirements: 1.1, 1.2, 3.4_

  - [x] 3.2 Modify existing Contact component for dual submission modes
    - Add submission type state management (message vs appointment)
    - Implement conditional rendering of date/time picker
    - Update form validation to include appointment fields when needed
    - Maintain existing form styling and animations
    - _Requirements: 1.1, 1.3_

- [x] 4. Implement form submission logic with calendar integration
  - [x] 4.1 Create appointment booking handler
    - Write handleAppointmentSubmission function with Microsoft Graph integration
    - Implement calendar event creation with visitor details in event body
    - Add proper error handling and user feedback for API failures
    - Include fallback to email-only submission on calendar errors
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.5_

  - [x] 4.2 Add client-side validation for appointment bookings
    - Implement real-time validation for selected date/time
    - Add error messages for outside business hours selections
    - Create validation feedback UI with clear error messaging
    - Ensure validation works across different timezones
    - _Requirements: 1.4, 3.5, 4.1, 4.2_

- [x] 5. Implement comprehensive error handling and user feedback
  - [x] 5.1 Create error handling service
    - Build ErrorHandler class with different error types (auth, api, validation)
    - Implement retry logic with exponential backoff for transient failures
    - Add error logging and monitoring integration
    - Create user-friendly error message mapping
    - _Requirements: 4.3, 4.4, 5.4, 5.5_

  - [x] 5.2 Add loading states and success feedback
    - Implement loading indicators for appointment booking process
    - Create success confirmation messages with appointment details
    - Add progress feedback during Microsoft Graph API calls
    - Update existing success message handling for both submission types
    - _Requirements: 4.1, 4.4_

- [x] 6. Add configuration and environment setup
  - [x] 6.1 Create configuration management
    - Set up environment variables for Microsoft Graph credentials
    - Create configuration validation on application startup
    - Implement feature flags for calendar booking functionality
    - Add business hours configuration with timezone support
    - _Requirements: 5.1, 5.2, 3.3_

  - [x] 6.2 Add translation support for new UI elements
    - Extend translations.ts with appointment booking text
    - Add error messages in both French and English
    - Include date/time picker labels and validation messages
    - Update existing contact form translations as needed
    - _Requirements: 1.1, 4.2, 4.3_

- [x] 7. Write comprehensive tests for calendar integration
  - [x] 7.1 Create unit tests for calendar services
    - Write tests for OAuth token management and refresh logic
    - Test business hours validation with various date/time combinations
    - Create mock tests for Microsoft Graph API integration
    - Add timezone conversion and edge case testing
    - _Requirements: 2.1, 2.5, 3.1, 3.2, 3.3_

  - [x] 7.2 Write integration tests for appointment booking flow
    - Create end-to-end tests for complete appointment booking process
    - Test error handling scenarios (API failures, invalid dates, auth issues)
    - Add tests for form validation and user feedback
    - Include accessibility testing for new UI components
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 4.4_

- [x] 8. Implement security and monitoring features
  - [x] 8.1 Add security measures
    - Implement input sanitization for all form fields
    - Add CSRF protection for appointment booking submissions
    - Create secure credential handling with proper encryption
    - Add rate limiting for calendar API calls
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 8.2 Add monitoring and logging
    - Implement structured logging for calendar API interactions
    - Add performance monitoring for appointment booking flow
    - Create error tracking and alerting for API failures
    - Include user interaction analytics (anonymized)
    - _Requirements: 2.5, 4.3, 5.4, 5.5_