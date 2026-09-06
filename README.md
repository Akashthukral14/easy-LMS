LMS Architecture & Functional Specification
Complete product architecture, functional requirements, business rules, security, reporting, and implementation
guidance
Learning Management System (LMS)
Product Architecture, Functional Specification, Business Logic &
Implementation README
Document Version: 1.0
Date: 06 September 2026
Product Type: Multi-Client Learning, Process Update, Assessment & Compliance Management System
---
1. Executive Summary
This document defines the complete architecture and functional specification for a role-based Learning Management
System (LMS) designed for multi-client BPO, travel, customer-support and operations environments.
The platform manages:
• Users
• Clients
• LOBs (Lines of Business)
• Locations
• Process updates
• Process documents
• Document versions
• Quizzes
• Assessments
• E-learning
• Performance
• Compliance
• Notifications
• Reports
• Data exports
• Audit logs
• User permissions
• User preferences
LMS Architecture & Functional Specification Page 1
• Administrative workflows
The application has three primary roles:
1. Agent
2. Admin
3. Super Admin
The system must use role-based access control (RBAC) + scope-based access control. Client, LOB and Location
restrictions must be enforced by the backend/API/database layer and not only by hiding frontend controls.
---
2. Core Product Principles
2.1 Simple
Agents should immediately understand:
• What is new?
• What is pending?
• What needs to be completed?
• How am I performing?
2.2 Secure
All authorization must be validated server-side.
2.3 Multi-client
One installation can support multiple clients without exposing data between clients.
2.4 Scope controlled
A user only accesses the Client + LOB + Location assigned to that user.
2.5 Auditable
Important actions must create immutable audit records.
2.6 User empowerment
Users can control their own:
LMS Architecture & Functional Specification Page 2
• Theme
• Accent color
• Interface density
• Icon size
• Sidebar behavior
• Animation level
• Password
• Active sessions
without changing other users' preferences.
---
3. High-Level Architecture
LMS APPLICATION
+---------------------+----------------------+
Authentication Frontend Backend/API
Login/Sessions React/Next.js Authorization
Password Policy Responsive UI Business Logic
Lockout Dashboards Validation
+---------------------+----------------------+
Service Layer
+------------+------------+------------+------------+
Users Content Learning Reports Audit
Clients Updates Quizzes Exports Logs
LOBs Documents Assessments Analytics
Locations E-learning
Data Layer
+---------------+---------------+
Database File Storage
PostgreSQL/MySQL S3-compatible storage
Redis
Cache / Sessions / Jobs
---
4. Recommended Technology Stack
Frontend
LMS Architecture & Functional Specification Page 3
Recommended:
• React
• Next.js
• TypeScript
• Tailwind CSS or equivalent design system
• Charting library
• Accessible component library
Backend
Recommended options:
• Node.js + NestJS
• or .NET Web API
• or Java Spring Boot
Database
Preferred:
• PostgreSQL
Alternative:
• MySQL
Storage
Use object storage for uploaded files:
• S3-compatible storage
• Azure Blob Storage
• Google Cloud Storage
Cache
• Redis
Background Processing
Use a queue/worker architecture for:
• Scheduled reminders
• Escalations
LMS Architecture & Functional Specification Page 4
• Large report generation
• Email notifications
• File processing
• Bulk imports
---
5. Roles
5.1 Agent
Agent is the learning/content consumer.
Agent can:
• Login
• View dashboard
• View assigned updates
• Open attachments
• Acknowledge updates
• Attempt quizzes
• Attempt assessments
• View e-learning
• View process documents
• View own performance
• View own history
• Search authorized content
• Configure personal settings
• Change password
• Manage own sessions
Agent cannot:
• Create updates
• Create quizzes
• Create assessments
• Manage users
• Manage clients
• View organization-wide reports
• Export LMS data
• Modify other users
• Modify permissions
LMS Architecture & Functional Specification Page 5
---
6. Admin
Admin manages users/content within an assigned scope.
Admin can:
• View assigned performance
• Create/update content
• Create quizzes
• Create assessments
• Manage users
• Upload documents
• Manage e-learning
• View reports
• Export authorized data
• Configure reminders
• Manage acknowledgements
• Use Agent View/Impersonation
• Use custom report builder
Admin cannot:
• Delete/deactivate Super Admin
• Delete clients
• Manage unrestricted global data
• Access clients/LOBs/locations outside assigned scope
• Modify Super Admin permissions
Admin permissions must be granular.
---
7. Super Admin
Super Admin has global system control.
Super Admin can:
• Manage all clients
• Manage locations
• Manage LOBs
• Manage Admins
LMS Architecture & Functional Specification Page 6
• Manage Agents
• Configure permissions
• Manage all content
• View global performance
• Export global reports/data
• Access audit logs
• Configure system settings
• Manage archived data
• Manage impersonation
• Manage administrative policies
At least one protected Super Admin account must always exist.
Admin must never be able to deactivate or delete a protected Super Admin.
---
8. Role + Scope + Permission Model
Do not implement authorization as:
Admin = Everything
Use:
USER
+-- ROLE
+-- CLIENT SCOPE
+-- LOB SCOPE
+-- LOCATION SCOPE
+-- GRANULAR PERMISSIONS
Example:
User: Rahul
Role: Admin
Client:
ABC
LOB:
International Voice
Domestic Voice
Location:
LMS Architecture & Functional Specification Page 7
Gurgaon
Permissions:
Create Update
Edit Update
Create Quiz
Create Assessment
View Reports
Export Reports
No permission:
Manage Clients
Manage Admins
Global Export
---
9. Client / LOB / Location Isolation
This is a mandatory security rule.
Example:
Client A
+-- LOB AA
+-- Gurgaon
+-- Noida
+-- LOB AB
+-- Gurgaon
Client B
+-- LOB BA
+-- Mumbai
If an Agent belongs to:
Client A
LOB AA
Gurgaon
the Agent must only see matching:
• Updates
LMS Architecture & Functional Specification Page 8
• Documents
• Quizzes
• Assessments
• E-learning
• Notifications
• Performance
• Search results
The same restriction applies to Admins.
The backend must enforce this restriction.
---
10. Authentication
Login Screen
Fields:
• Username
• Password
• Show/hide password
• Remember device
• Login
• Admin Login option
• Forgot password
Admin Login Option
If Agent selects Admin Login:
If valid credentials
AND role = Admin/Super Admin
-> continue
If role = Agent
-> "You do not have Admin access."
Do not reveal whether an account exists when credentials are incorrect.
Recommended generic message:
Incorrect username or password.
LMS Architecture & Functional Specification Page 9
---
11. Login Attempt Logic
Default:
Maximum attempts = 3
Lock duration = 30 minutes
Workflow:
Attempt 1 -> Failure -> remaining attempts = 2
Attempt 2 -> Failure -> remaining attempts = 1
Attempt 3 -> Failure -> account locked
During lock:
Login blocked until lock expiry timestamp.
After 30 minutes:
Account becomes eligible for login again.
Record:
• Failed attempt
• Timestamp
• IP
• Device/session metadata
• Lock event
• Unlock event
---
12. Password Management
New users receive a temporary password.
Example:
Welcome123
The system must never store this password as plain text.
Use secure password hashing.
On first login:
LMS Architecture & Functional Specification Page 10
temporary_password = true
User must change password.
Password requirements:
• Minimum 8 characters
• Uppercase
• Lowercase
• Number
• Special character
Recommended additional controls:
• Password history
• Password expiry policy configurable by Super Admin
• Logout other sessions after password change
---
13. Main Application Layout
+--------------------------------------------------------------+
Logo Global Search Notifications Profile
+----------------+---------------------------------------------+
Dashboard
Performance
Updates MAIN CONTENT
Assessments
E-learning
Documents
Reports
Management
Settings
+----------------+---------------------------------------------+
Navigation must be dynamically generated from role + permission.
---
14. Profile
Profile contains:
LMS Architecture & Functional Specification Page 11
Personal Information
• Name
• Username
• Role
• Client
• LOB
• Location
• Email
• Phone
• Employee ID
• Joining date
• Account status
Password
Require:
• Current password
• New password
• Confirm password
Switch User
Visible only to Admin/Super Admin.
---
15. User Settings
Settings are user-specific.
Theme
• Light
• Dark
• System
Accent Color
Provide predefined accessible accent colors.
LMS Architecture & Functional Specification Page 12
Interface Density
• Compact
• Comfortable
• Spacious
Icon Size
• Small
• Medium
• Large
Sidebar
• Expanded
• Collapsed
Animation
• Full
• Reduced
• Off
The selected configuration is stored against the user's settings record.
Changing settings must never change another user's interface.
---
16. Dashboard
The dashboard must answer:
> What do I need to do today?
Agent Dashboard
Cards:
• Pending Updates
• Completed Updates
• Pending Quizzes
• Quiz Average
• Pending Assessments
LMS Architecture & Functional Specification Page 13
• Assessment Average
• E-learning Completion
• Training Compliance
Example:
Pending Updates 04
Completed Updates 28
Quiz Average 86%
Assessment Average 91%
Compliance 94%
Admin Dashboard
Show:
• Total users
• Active users
• Pending updates
• Overdue updates
• Quiz average
• Assessment average
• Completion rate
• Compliance rate
• Failed assessments
Only show data within Admin scope.
Super Admin Dashboard
Show global:
• Client count
• LOB count
• User count
• Training completion
• Compliance
• Client comparison
• LOB comparison
• Location comparison
• Failed assessment trend
---
LMS Architecture & Functional Specification Page 14
17. Performance Module
Agent
Agent sees only own performance.
Filters:
• Today
• Yesterday
• Last 7 days
• Last 30 days
• Current month
• Previous month
• Custom date
• Client
• LOB
• Category
• Update
• Quiz
• Assessment
Metrics:
• Update acknowledgement %
• Quiz average
• Assessment average
• Completion %
• Pass %
• Failed attempts
• Pending activities
• Average completion time
• Compliance score
Admin
Admin sees users inside authorized scope.
Drill-down:
Client
-> LOB
LMS Architecture & Functional Specification Page 15
-> Location
-> User
-> Update
-> Quiz
-> Question
Super Admin
Global performance with all filters.
---
18. Update Module
Each update contains:
• Automatically generated Update ID
• Topic
• Title
• Description
• Client
• LOB
• Location
• Category
• Priority
• Created date/time
• Effective date/time
• Due date/time
• Expiry date/time
• Version
• Created by
• Last modified by
• Status
• Attachments
• Quiz requirement
---
19. Update ID
Update ID must be automatically generated and unique.
LMS Architecture & Functional Specification Page 16
Recommended:
UPD-YYYYMMDD-CLIENT-LOB-SEQUENCE
Example:
UPD-20260906-ABC-INT-001
Never trust user-entered IDs for uniqueness.
Use a database unique constraint as the final protection.
---
20. Update Categories
Allow configurable categories such as:
• Process Change
• Policy
• Compliance
• Product
• System
• Customer Handling
• Quality
• Safety
• Escalation
• General
Super Admin can add/remove categories.
---
21. Update Attachments
Supported examples:
• PDF
• DOC
• DOCX
• PPT
• PPTX
• XLS
• XLSX
• JPG
LMS Architecture & Functional Specification Page 17
• JPEG
• PNG
• MP4
System must validate:
• File extension
• MIME type
• File size
• Storage path
• Security scan where available
Uploaded files must not be executable.
---
22. Update Attachment View Logic
Agent workflow:
Open Update
View attachment
System records viewed event
Acknowledgement becomes available
Before attachment viewing:
Acknowledgement = DISABLED
After required content has been viewed:
Acknowledgement = ENABLED
For updates requiring a quiz:
View Attachment
Click Acknowledge
Quiz Opens
Pass?
/ \
Yes No
Complete Retry
---
LMS Architecture & Functional Specification Page 18
23. Quiz Logic
Quiz supports:
• Quiz title
• Automatic quiz ID
• Question
• Options
• Correct answer
• Marks
• Passing percentage
• Time limit
• Attempt limit
• Random question order
• Random option order
• Negative marking
• Question attachment
• Answer explanation
• Show answers after submission
All should be configurable.
---
24. Quiz Result Logic
Example:
Score: 85%
Correct: 17/20
Wrong: 3
Status: PASSED
If failed:
Score: 65%
Status: FAILED
Attempts remaining: 1
Do not overwrite previous attempts.
Store every attempt separately.
---
LMS Architecture & Functional Specification Page 19
25. Quiz Answer Review
If enabled by creator:
After submission show:
Question 1
Your answer: B
Correct answer: B
Status: Correct
Explanation:
...
If disabled, show only the final result.
---
26. Update Acknowledgement Completion
If an update requires a quiz:
Attachment viewed
Quiz completed
Passing score achieved
Acknowledgement = COMPLETED
If quiz fails:
Acknowledgement = NOT COMPLETED
If the creator allows retry, the Agent can attempt again.
---
27. Due Dates
Updates, quizzes and assessments can have:
• Start date
• Effective date
• Due date
• Expiry date
LMS Architecture & Functional Specification Page 20
Statuses:
• Not Started
• In Progress
• Completed
• Due Soon
• Overdue
• Expired
---
28. Automated Reminders
Configurable schedule:
7 days before -> Reminder
3 days before -> Reminder
1 day before -> Urgent reminder
Due date -> Final reminder
1 day overdue -> Admin alert
3 days overdue -> Escalation
Rules should be configurable.
Do not send reminders after successful completion.
---
29. Draft -> Review -> Publish
Content workflow:
Draft
Review
Approved
Scheduled
Published
Expired
Archived
Optional approval:
Creator
Reviewer
LMS Architecture & Functional Specification Page 21
Publisher
Publishing should require confirmation.
---
30. Update Version Control
Updates should support versions:
Version 1.0
Version 1.1
Version 2.0
Each version retains:
• Content
• Attachments
• Author
• Timestamp
• Change notes
---
31. Version-Based Reacknowledgement
If an update version changes and reacknowledgement is enabled:
Old acknowledgement -> Historical
New version -> Pending
Agent must complete the required new workflow.
For example:
Update v1.0 -> acknowledged
Update v2.0 -> new acknowledgement required
---
32. Document Library
Document structure:
Process Documents
+-- SOP
LMS Architecture & Functional Specification Page 22
+-- Work Instructions
+-- Policies
+-- FAQs
+-- Escalation Matrix
+-- Process Flow
+-- Reference Material
Features:
• Search
• Filter
• Preview
• Download based on permission
• Version
• Effective date
• Expiry date
• Owner
---
33. Document Version Control
Example:
Refund SOP
v1.0 -> January
v1.1 -> March
v2.0 -> September
Agents normally see the latest active version.
Admins/Super Admins can access historical versions according to permission.
---
34. Assessment Module
Assessments are separate from Update Quizzes.
Use assessments for:
• Monthly tests
• Process certification
• New-hire assessment
LMS Architecture & Functional Specification Page 23
• Refresher training
• Compliance
• Product tests
• Quality assessments
---
35. Assessment Creation
Fields:
• Assessment name
• Client
• LOB
• Location
• Category
• Folder/path
• Description
• Start date
• End date
• Time limit
• Passing percentage
• Attempts
• Question randomization
• Answer visibility
• Pass message
• Fail message
---
36. Assessment Folder Structure
Example:
Client A
+-- International Voice
+-- Monthly Assessment
+-- Compliance
+-- Product
+-- Domestic Voice
+-- Monthly Assessment
LMS Architecture & Functional Specification Page 24
Agents only see folders mapped to their scope.
---
37. Assessment Excel Upload
Provide downloadable template.
Required columns:
Question
Option A
Option B
Option C
Option D
Correct Answer
Marks
Optional:
Explanation
Attachment
Category
---
38. Excel Validation
Workflow:
Upload
Parse
Validate
Show Errors
Preview
Edit/Correct
Validate Again
Submit
Example:
Row 14:
Correct answer missing
LMS Architecture & Functional Specification Page 25
Row 19:
Option C missing
Row 27:
Correct answer must be A/B/C/D
Never silently import invalid records.
---
39. Assessment Preview
Before publishing:
• Assessment title
• Number of questions
• Time limit
• Passing percentage
• Questions
• Options
• Attachments
Actions:
Back
Save Draft
Publish
Schedule
Publishing requires confirmation.
---
40. Assessment Status
Use:
• Draft
• Scheduled
• Published
• Active
• Expired
• Archived
Published assessments should not be destructively edited if attempts already exist.
LMS Architecture & Functional Specification Page 26
Create a new version instead.
---
41. E-Learning Module
Support:
• Video
• PDF
• PPT
• Text lesson
• Image
• Audio
• SCORM where supported
• Interactive learning
Track:
• Started
• In Progress
• Completed
• Percentage
• Time spent
• Last accessed
• Completion date
---
42. Certificates
Eligible learning/assessment completion can generate certificates.
Certificate contains:
• Employee name
• Course/assessment
• Score
• Completion date
• Certificate ID
• Validity if applicable
• QR verification
---
LMS Architecture & Functional Specification Page 27
43. User Management
Admin/Super Admin can manage users according to scope.
User fields:
• Username
• Full name
• Email
• Phone
• Employee ID
• Role
• Client
• LOB
• Location
• Joining date
• Status
Statuses:
• Active
• Inactive
• Locked
• Suspended
• Archived
---
44. User Creation
Workflow:
Create User
Username/name/email/phone
Select Client
Select LOB
Select Location
Assign Role
Assign Permissions
Generate temporary password
Activate
LMS Architecture & Functional Specification Page 28
LOB list must be filtered by selected Client.
Location list must be filtered by selected Client/LOB configuration.
---
45. Client Management
Super Admin can create:
• Client name
• Client code
• Locations
• LOBs
• Contact details
• Status
• Effective date
Admin cannot delete a Client.
Super Admin controls client deletion/archive.
Prefer archive over permanent deletion.
---
46. Admin Scope Management
Super Admin can assign Admin scope:
Admin
+-- Client A
+-- LOB AA
+-- Gurgaon
+-- LOB AB
+-- Noida
Admin can only operate inside this scope.
---
47. Bulk User Upload
Template:
LMS Architecture & Functional Specification Page 29
Username
Name
Email
Phone
Role
Client
LOB
Location
Workflow:
Download template
Fill Excel
Upload
Validate
Preview
Correct errors
Submit
Create valid records
Errors must identify exact row/cell.
Example:
Row 14, Client:
Client does not exist
Row 22, LOB:
LOB does not belong to selected Client
Row 37, Email:
Invalid email format
---
48. Soft Delete / Archive
Important business records should not normally be physically deleted.
Use:
Active
Archived
LMS Architecture & Functional Specification Page 30
Soft Deleted
Historical reports must remain accurate.
Permanent deletion should be restricted to Super Admin and only for records that are safe to permanently remove.
---
49. Reports
Reports are visible only to:
• Admin
• Super Admin
Agents cannot access organizational reports.
Update Reports
• Update-wise
• Client-wise
• LOB-wise
• Location-wise
• Date-wise
• Status-wise
Acknowledgement Reports
• User-wise
• Update-wise
• Pending
• Completed
• Overdue
• Completion time
Quiz Reports
• User-wise
• Quiz-wise
• Question-wise
• Attempt-wise
• Pass/fail
• Average score
LMS Architecture & Functional Specification Page 31
• Client-wise
• LOB-wise
Assessment Reports
• Agent-wise
• Question-wise
• Client-wise
• LOB-wise
• Location-wise
• Score-wise
• Pass/fail
• Attempts
---
50. Data Download / Export
Only Admin and Super Admin can export LMS data.
Agents cannot export reports or organizational data.
Supported formats:
• XLSX
• CSV
• PDF
Export examples:
Update Data
Acknowledgement Data
Quiz Results
Assessment Results
Performance
User Data
Training Compliance
---
51. Admin Export Scope
Admin can only export data within assigned scope.
LMS Architecture & Functional Specification Page 32
Example:
Admin scope:
Client A
LOB AA
Gurgaon
Admin export must automatically apply this scope.
Admin cannot manipulate URL/API parameters to export another Client.
---
52. Super Admin Export
Super Admin can export global data.
Examples:
All Clients
All LOBs
All Locations
All Users
All Updates
All Assessments
All Quiz Results
Global Performance
---
53. Export Permission Model
Separate permissions:
Export Update Data
Export User Data
Export Performance
Export Quiz Data
Export Assessment Data
Export Reports
Download Attachments
This lets Super Admin restrict specific Admin export abilities.
LMS Architecture & Functional Specification Page 33
---
54. Export Audit
Every export must create an audit record:
User
Role
Report/export type
Scope
Record count
File format
Timestamp
IP/device metadata
Example:
Rahul | Admin
Monthly Compliance
ABC / International / Gurgaon
1,248 records
XLSX
06 Sep 2026 16:42
---
55. Custom Report Builder
Admin/Super Admin can create reports dynamically.
Workflow:
Select Report Type
Select Fields
Select Filters
Select Grouping
Preview
Save Report
Export
Saved reports:
• Can be reused
LMS Architecture & Functional Specification Page 34
• Can be edited
• Can be deleted by creator/authorized admin
• Must retain permission scope
---
56. Saved Filters
Users can save commonly used filters.
Examples:
Agent:
My Pending Updates
Admin:
ABC International Overdue
Super Admin:
All Failed Assessments - September
Saved filters must not bypass authorization.
---
57. Global Search
Search authorized:
• Updates
• Documents
• Assessments
• Quizzes
• Update IDs
• Topics
Search must respect scope.
Example:
Search: Refund
Updates: 15
Documents: 7
Assessments: 3
LMS Architecture & Functional Specification Page 35
---
58. Notifications
Notification center:
• New update
• New assessment
• Quiz result
• Assessment result
• Overdue activity
• Due-soon reminder
• Document change
• Certificate generated
Notification statuses:
• Unread
• Read
• Archived
---
59. Audit Logs
Audit logs must record:
• Login
• Failed login
• Logout
• Password change
• User creation
• User modification
• User deactivation
• User archive
• Update creation
• Update modification
• Update publication
• Update archival
• Document upload
• Document version creation
• Quiz creation
LMS Architecture & Functional Specification Page 36
• Assessment publication
• Report generation
• Export
• File download
• Permission change
• Client modification
• Scope modification
• Impersonation
Audit records should be append-only for normal administrators.
---
60. Activity Timeline
Every important content object should have a timeline.
Example:
10:05 - Update created
10:12 - Attachment uploaded
10:18 - Quiz added
10:25 - Update published
11:03 - First agent viewed
11:15 - First acknowledgement
---
61. Impersonation / Switch User
Only Admin/Super Admin.
Purpose:
> Check exactly what an Agent sees.
Workflow:
Admin
Select Agent
Enter Agent View
Read-only Agent interface
Return to Admin
LMS Architecture & Functional Specification Page 37
Recommended default:
Impersonation is read-only.
Do not allow an impersonating administrator to:
• Submit an assessment
• Acknowledge an update
• Change Agent password
• Change Agent data
• Perform destructive actions
All impersonation sessions must be logged.
---
62. Session & Device Management
User can view active sessions:
Current Device
iPhone
Active Now
Windows Chrome
Last Active: 2 hours ago
Actions:
• Logout individual session
• Logout all other sessions
Admin/Super Admin can access authorized session/security information.
---
63. Autosave
Autosave drafts for:
• Updates
• Quizzes
• Assessments
• Reports
Display:
LMS Architecture & Functional Specification Page 38
Saved 12 seconds ago
If browser closes:
Recover Draft
Draft recovery must not accidentally publish content.
---
64. Accessibility
Support:
• Keyboard navigation
• Screen-reader labels
• Accessible contrast
• Focus states
• Adjustable text size
• Reduced motion
• Animation off
• Accessible form validation
---
65. Moving Graphics / UI Animation
Use subtle modern animations:
• Animated dashboard counters
• Progress bars
• Progress rings
• Chart entrance animations
• Card hover
• Page transitions
• Skeleton loading
• Notification animation
• Subtle background motion
Avoid excessive animation.
The interface should feel:
• Light
• Modern
LMS Architecture & Functional Specification Page 39
• Corporate
• Interactive
• Fast
---
66. Download Rules
There are two different concepts:
Content file download
Downloading an actual PDF/video/document.
This can be controlled by content permission.
Data export
Downloading LMS records/reports.
Only:
• Admin
• Super Admin
can do this.
This distinction must exist in the permission model.
---
67. Security Requirements
Mandatory:
• Password hashing
• HTTPS
• Secure sessions
• JWT/access token or secure session architecture
• Refresh token/session rotation where applicable
• RBAC
• Scope-based authorization
• Rate limiting
• Account lockout
• Input validation
LMS Architecture & Functional Specification Page 40
• Output encoding
• XSS protection
• SQL injection protection
• CSRF protection where applicable
• Secure cookies
• File validation
• File size limits
• Malware scanning where available
• Audit logging
---
68. File Security
Upload pipeline:
Upload
Extension check
MIME validation
Size validation
Security scan
Secure object storage
Database reference
Available to authorized users
Do not expose unrestricted filesystem paths.
Use signed/authorized download URLs where appropriate.
---
69. Database Entities
Recommended core tables:
users
roles
permissions
role_permissions
user_permissions
clients
locations
LMS Architecture & Functional Specification Page 41
lobs
client_locations
client_lobs
user_client_lob_location_mapping
updates
update_versions
update_attachments
update_acknowledgements
quizzes
quiz_questions
quiz_options
quiz_attempts
quiz_answers
assessments
assessment_versions
assessment_questions
assessment_options
assessment_attempts
assessment_answers
documents
document_versions
elearning_courses
elearning_modules
learning_progress
certificates
notifications
reports
saved_reports
saved_filters
audit_logs
impersonation_sessions
sessions
login_attempts
LMS Architecture & Functional Specification Page 42
user_settings
categories
folders
---
70. Important Database Rules
Use foreign keys.
Use indexes on:
client_id
lob_id
location_id
user_id
update_id
assessment_id
quiz_id
created_at
status
Use unique constraints for:
• Username
• Client code
• Update ID
• Certificate ID
• Relevant version numbers
Use soft-delete fields where appropriate:
deleted_at
deleted_by
---
71. API Authorization
Every protected API endpoint must validate:
Authentication
+
LMS Architecture & Functional Specification Page 43
Client Scope
Role
+
+
+
+
Permission
LOB Scope
Location Scope
Example:
GET /updates
Backend must automatically filter based on the authenticated user's scope.
Never trust:
?clientId=ABC
from the frontend without authorization validation.
---
72. Performance & Scalability
Use:
• Server-side pagination
• Server-side filtering
• Database indexes
• Query optimization
• Redis caching where useful
• Lazy loading
• Background report generation
• Object storage for large files
• CDN for suitable static/media content
• Queue workers for notifications
• Streaming/export jobs for large datasets
Do not load thousands of users into the browser unnecessarily.
---
LMS Architecture & Functional Specification Page 44
73. Large Report Handling
For small reports:
Generate
-> Download
For large reports:
Request Export
Background Job
Generate File
Notify User
Download
Example:
> Your report is ready.
The report should automatically expire from temporary storage after a configured period.
---
74. Business Rules Summary
Agent
Agent can only view assigned content.
Agent cannot export LMS data.
Agent must view required attachment before acknowledgement.
If quiz required:
quiz must be passed before update completion.
Failed quiz:
retry only if attempts remain.
Performance:
only own data.
Admin
Admin can operate only within assigned scope.
LMS Architecture & Functional Specification Page 45
Admin can create/manage content if permission exists.
Admin can export only authorized data.
Admin cannot delete/deactivate Super Admin.
Admin cannot delete Client.
Admin actions are audited.
Super Admin
Global access.
Controls clients, admins, users, permissions and system configuration.
Can export global data.
Can access global audit logs.
Protected Super Admin cannot be deleted/deactivated by Admin.
---
75. Update Completion State Machine
NOT_STARTED
v
VIEWED
v
ATTACHMENT_VIEWED
+-----------------------+
No Quiz Required Quiz Required
v v
ACKNOWLEDGE QUIZ_STARTED
+-------+-------+
PASS FAIL
v v
ACKNOWLEDGED RETRY
Attempts Exhausted
v
FAILED
---
LMS Architecture & Functional Specification Page 46
76. Assessment State Machine
DRAFT
v
SCHEDULED
v
PUBLISHED
v
STARTED
v
SUBMITTED
+----------+
PASS FAIL
v v
PASSED FAILED
v
CERTIFICATE (if configured)
---
77. User State Machine
INVITED
v
ACTIVE
+--> LOCKED
+--> SUSPENDED
+--> INACTIVE
v
ARCHIVED
Do not use permanent deletion as the normal user lifecycle.
---
78. Update Lifecycle
DRAFT
REVIEW
APPROVED
LMS Architecture & Functional Specification Page 47
SCHEDULED
PUBLISHED
EXPIRED
ARCHIVED
---
79. Recommended UI Components
Create reusable components:
• Sidebar
• Topbar
• Profile menu
• Search
• Notification panel
• Data table
• Filter panel
• Date picker
• Pagination
• Modal
• Drawer
• Confirmation dialog
• File uploader
• File previewer
• Quiz builder
• Assessment builder
• Excel importer
• Progress card
• Performance chart
• Timeline
• Status badge
• Permission matrix
• Scope selector
---
80. Error Handling
Errors must be clear and actionable.
Bad:
LMS Architecture & Functional Specification Page 48
Error 500
Better:
Unable to publish this update.
Please complete:
• Client
• LOB
• Effective date
• Attachment
For Excel:
6 records contain errors.
Download error report
or
Edit rows and validate again.
---
81. Confirmation Rules
Use confirmation before:
• Publish
• Archive
• Deactivate user
• Delete/soft-delete
• Change permissions
• Change Admin scope
• Bulk import
• Large export
• Permanent deletion
Example:
Publish Update?
This update will become visible to:
Client A
LOB International
Gurgaon
LMS Architecture & Functional Specification Page 49
126 users
[Cancel] [Publish]
---
82. Notification Rules
Do not notify users unnecessarily.
Example:
If Agent completes an assessment:
Result notification -> Agent
Completion update -> Admin
Global metric update -> Super Admin dashboard
Do not send duplicate notifications for the same event.
---
83. Compliance Dashboard
Recommended KPI:
Training Compliance Score
Potential calculation:
Compliance =
Update Completion Weight
+
Quiz Completion Weight
+
Assessment Completion Weight
+
E-learning Completion Weight
Weights should be configurable.
Example:
Updates 25%
Quizzes 25%
Assessments 30%
LMS Architecture & Functional Specification Page 50
E-learning 20%
The exact formula must be configurable by Super Admin.
---
84. Leaderboard
Optional feature.
Can be enabled/disabled.
Possible ranking:
• Quiz score
• Assessment score
• Completion
• Compliance
Do not expose individual rankings if organizational policy does not permit it.
---
85. System Settings
Super Admin can configure:
• Password policy
• Login attempts
• Lockout duration
• File upload limits
• Allowed file types
• Quiz attempt rules
• Reminder schedules
• Notification settings
• Compliance formula
• Categories
• Default theme
• Session timeout
• Archive policies
---
86. Logging Strategy
LMS Architecture & Functional Specification Page 51
Separate logs:
Audit Log
Business/user actions.
Application Log
Technical application events.
Security Log
Authentication/security events.
Export Log
Data export/download events.
Do not mix all logs into one unstructured table if high-scale observability is required.
---
87. Backup & Recovery
Production system should implement:
• Automated database backups
• File-storage redundancy
• Backup retention
• Recovery testing
• Disaster recovery plan
• Restore procedures
Critical audit data should be included in backups.
---
88. Testing Strategy
Unit Tests
Test:
• Permission logic
LMS Architecture & Functional Specification Page 52
• Scope logic
• Quiz scoring
• Assessment scoring
• Due dates
• Compliance calculation
• Login lockout
Integration Tests
Test:
• User creation
• Update publishing
• Quiz workflow
• Assessment workflow
• Excel import
• Reports
• Exports
Security Tests
Test:
• Unauthorized API access
• Client data isolation
• LOB isolation
• Location isolation
• Role escalation
• Export authorization
• Impersonation restrictions
UI Tests
Test:
• Login
• Responsive layouts
• Forms
• Filters
• Tables
• Quiz
• Assessment
LMS Architecture & Functional Specification Page 53
• Accessibility
---
89. Critical Security Test Cases
These must pass before production.
Test 1
Agent tries to call Admin API.
Expected:
403 Forbidden
Test 2
Admin tries to access another Client.
Expected:
403 Forbidden
or empty authorized result.
Test 3
Admin modifies Client ID in API request.
Expected:
Request rejected.
Test 4
Agent tries report endpoint.
Expected:
403 Forbidden
Test 5
Agent tries export endpoint.
Expected:
403 Forbidden
LMS Architecture & Functional Specification Page 54
Test 6
Admin tries to delete Super Admin.
Expected:
403 Forbidden
Test 7
Admin impersonates Agent.
Expected:
Read-only Agent view
+
Audit record
---
90. Recommended Development Phases
Phase 1 — Foundation
• Authentication
• Roles
• Permissions
• Clients
• LOBs
• Locations
• User management
• Scope isolation
Phase 2 — Updates
• Update creation
• Attachments
• Versioning
• Acknowledgement
• Quiz
• Due dates
Phase 3 — Assessments
LMS Architecture & Functional Specification Page 55
• Assessment builder
• Excel upload
• Validation
• Preview
• Attempts
• Scoring
Phase 4 — Learning
• Documents
• E-learning
• Progress
• Certificates
Phase 5 — Analytics
• Performance
• Reports
• Custom report builder
• Export
Phase 6 — Enterprise Features
• Notifications
• Automation
• Audit logs
• Impersonation
• Session management
• Advanced settings
Phase 7 — Optimization
• Accessibility
• Performance
• Security hardening
• Monitoring
• Backup/recovery
• Load testing
---
LMS Architecture & Functional Specification Page 56
91. Definition of Done
The LMS should not be considered production-ready until:
• Role restrictions work server-side.
• Client isolation works.
• LOB isolation works.
• Location isolation works.
• Admin scope restrictions work.
• Export permissions work.
• Audit logs work.
• Login lockout works.
• Quiz scoring is tested.
• Assessment scoring is tested.
• Excel validation works.
• Update acknowledgement workflow works.
• Version reacknowledgement works.
• Due dates work.
• Reminder rules work.
• Reports are accurate.
• Historical records are retained.
• Soft delete works.
• Impersonation is audited.
• File uploads are secured.
• Accessibility checks pass.
• Mobile Agent experience works.
• Database backups are configured.
---
92. Final Product Navigation
Agent
Dashboard
Performance
Updates
Assessments
E-Learning
Process Documents
LMS Architecture & Functional Specification Page 57
Notifications
Profile
Settings
Admin
Dashboard
Performance
Updates
Update Management
Assessments
E-Learning
Process Documents
Reports
User Management
Notifications
Profile
Settings
Super Admin
Dashboard
Global Performance
Updates
Update Management
Assessments
E-Learning
Process Documents
Reports
User Management
Client Management
Admin Management
Permissions
Audit Logs
System Settings
Notifications
Profile
Settings
LMS Architecture & Functional Specification Page 58
---
93. Final Architecture Recommendation
The system should be built as a permission-driven, multi-tenant learning and process compliance platform.
The core authorization model should always be:
Authenticated User
v
Role
v
Permission
v
v
v
v
Client Scope
LOB Scope
Location Scope
Resource Access
The core learning workflow should be:
Content Created
v
Draft
v
Review
v
Publish/Schedule
v
v
v
Assigned to Scope
Agent Views
Attachment Viewed
v
Quiz/Assessment
v
LMS Architecture & Functional Specification Page 59
Result
v
v
Acknowledgement/Completion
Performance
v
v
Reporting
Export (Admin/Super Admin only)
This architecture provides a strong foundation for a scalable corporate LMS and allows future roles such as Trainer,
Quality Manager, Client Manager, Auditor or Reporting Manager to be added through permissions rather than
rebuilding the platform.
LMS Architecture & Functional Specification Page 60
