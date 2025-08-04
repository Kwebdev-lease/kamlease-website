# Requirements Document

## Introduction

This feature adds calendar booking functionality to the Kamlease website contact form. When visitors submit the contact form, they can choose between sending a simple message or booking an appointment that automatically creates an event in the contact@kamlease.com Outlook calendar. The booking system enforces business hours (Monday-Friday, 14:00-16:30 Paris time) and integrates with Microsoft Graph API for calendar management.

## Requirements

### Requirement 1

**User Story:** As a website visitor, I want to book an appointment directly through the contact form, so that I can schedule a meeting without additional email exchanges.

#### Acceptance Criteria

1. WHEN a visitor accesses the contact form THEN the system SHALL display two submission options: "Envoyer le message" and "Choisir votre rendez-vous"
2. WHEN a visitor selects "Choisir votre rendez-vous" THEN the system SHALL display a date/time picker with available slots
3. WHEN a visitor selects a date/time THEN the system SHALL validate it falls within business hours (Monday-Friday, 14:00-16:30 Europe/Paris)
4. IF the selected time is outside business hours THEN the system SHALL display an error message and prevent submission

### Requirement 2

**User Story:** As a business owner, I want appointment bookings to automatically create calendar events in my Outlook calendar, so that I can manage my schedule efficiently.

#### Acceptance Criteria

1. WHEN a visitor submits an appointment booking THEN the system SHALL authenticate with Microsoft Graph API using OAuth2 client credentials
2. WHEN authentication is successful THEN the system SHALL create a calendar event in contact@kamlease.com calendar
3. WHEN creating the event THEN the system SHALL include visitor details (prénom, nom, société, message) in the event body
4. WHEN the event is created THEN the system SHALL set the subject as "RDV via le site"
5. IF the API call fails THEN the system SHALL log the error and display a user-friendly error message

### Requirement 3

**User Story:** As a business owner, I want to enforce my availability schedule, so that appointments are only booked during my working hours.

#### Acceptance Criteria

1. WHEN the system validates appointment times THEN it SHALL only allow Monday through Friday
2. WHEN validating time slots THEN the system SHALL only allow times between 14:00 and 16:30
3. WHEN processing times THEN the system SHALL use Europe/Paris timezone (GMT+1)
4. WHEN displaying available slots THEN the system SHALL show only valid business hour options
5. IF a visitor attempts to book outside business hours THEN the system SHALL prevent the booking and show appropriate messaging

### Requirement 4

**User Story:** As a website visitor, I want clear feedback when booking appointments, so that I know whether my booking was successful or if there were any issues.

#### Acceptance Criteria

1. WHEN an appointment booking is successful THEN the system SHALL display a confirmation message
2. WHEN there are validation errors THEN the system SHALL display specific error messages for each issue
3. WHEN there are API errors THEN the system SHALL display a user-friendly error message without exposing technical details
4. WHEN the form is processing THEN the system SHALL show a loading indicator
5. WHEN booking fails THEN the system SHALL allow the visitor to retry or fall back to simple message sending

### Requirement 5

**User Story:** As a developer, I want secure API integration with Microsoft Graph, so that calendar access is properly authenticated and authorized.

#### Acceptance Criteria

1. WHEN authenticating with Microsoft Graph THEN the system SHALL use the provided client credentials (tenant_id, client_id, client_secret)
2. WHEN making API calls THEN the system SHALL use the Calendars.ReadWrite permission scope
3. WHEN storing credentials THEN the system SHALL keep them secure and not expose them in client-side code
4. WHEN tokens expire THEN the system SHALL handle token refresh appropriately
5. IF authentication fails THEN the system SHALL log the error and gracefully degrade to email-only functionality