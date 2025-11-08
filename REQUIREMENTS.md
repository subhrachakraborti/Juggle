# Requirements Document

## Introduction

Juggle is an agentic AI financial coaching platform designed to provide proactive financial guidance for individuals with irregular income patterns, particularly gig workers, freelancers, and informal sector employees in India. The system integrates financial data from bank accounts and personal calendar events to forecast cash flow challenges and deliver personalized, actionable recommendations before financial stress occurs.

## Glossary

- **Juggle System**: The complete AI-powered financial coaching platform including frontend, backend, AI agent, and data integrations
- **AI Agent**: The intelligent component that analyzes financial data, learns user patterns, and generates personalized recommendations
- **Financial Data Stream**: Transaction history, account balances, and income patterns from connected bank accounts
- **Calendar Data Stream**: Upcoming events from Google Calendar that may have financial implications
- **Cash Flow Forecast**: Predicted future income and expenses based on historical patterns and upcoming commitments
- **Micro-Savings Plan**: Automated daily or weekly savings strategy to prepare for anticipated expenses
- **User**: Individual utilizing the Juggle platform, primarily gig workers or those with irregular income
- **Financial Commitment**: Any upcoming expense identified from calendar events or recurring bills
- **Shortfall**: Projected deficit when anticipated expenses exceed expected income for a given period

## Requirements

### Requirement 1

**User Story:** As a gig worker with irregular income, I want to securely connect my bank accounts to Juggle, so that the system can analyze my financial patterns without compromising my security.

#### Acceptance Criteria

1. WHEN the User initiates bank account connection, THE Juggle System SHALL integrate with Plaid API to establish secure authentication
2. THE Juggle System SHALL encrypt all financial credentials using industry-standard encryption protocols before storage
3. WHEN bank account connection is successful, THE Juggle System SHALL retrieve transaction history for the previous 90 days within 30 seconds
4. THE Juggle System SHALL display connected account information including institution name and masked account number to the User
5. WHEN the User requests account disconnection, THE Juggle System SHALL revoke all access tokens and delete stored credentials within 5 seconds

### Requirement 2

**User Story:** As a user planning my month, I want Juggle to access my Google Calendar events, so that the system can anticipate expenses related to birthdays, travel, and other commitments.

#### Acceptance Criteria

1. WHEN the User authorizes calendar access, THE Juggle System SHALL integrate with Google Calendar API using OAuth 2.0 authentication
2. THE Juggle System SHALL retrieve calendar events for the next 90 days within 10 seconds of authorization
3. WHEN a calendar event contains financial keywords (birthday, travel, bill, insurance, festival), THE Juggle System SHALL flag the event as a potential Financial Commitment
4. THE Juggle System SHALL sync calendar data every 24 hours to capture newly added events
5. THE Juggle System SHALL respect User privacy by only processing event titles and dates without accessing event descriptions or attendee information

### Requirement 3

**User Story:** As a user with varied spending habits, I want Juggle to automatically categorize my transactions, so that I can understand my spending patterns without manual data entry.

#### Acceptance Criteria

1. WHEN new transactions are retrieved from the Financial Data Stream, THE AI Agent SHALL categorize each transaction into predefined categories (groceries, transport, dining, subscriptions, utilities, entertainment, healthcare, other) within 2 seconds per transaction
2. THE AI Agent SHALL achieve a minimum categorization accuracy of 85% based on merchant names and transaction descriptions
3. WHEN the User manually corrects a transaction category, THE AI Agent SHALL learn from the correction and apply the pattern to future similar transactions
4. THE Juggle System SHALL display categorized spending summaries for the last 7 days, 30 days, and 90 days
5. THE Juggle System SHALL identify recurring transactions that occur at regular intervals (weekly, monthly, quarterly)

### Requirement 4

**User Story:** As a freelancer with irregular income, I want Juggle to recognize my income patterns, so that the system can accurately forecast my future cash flow.

#### Acceptance Criteria

1. WHEN analyzing the Financial Data Stream, THE AI Agent SHALL identify income deposits by detecting transactions above ₹1,000 with positive values
2. THE AI Agent SHALL calculate average monthly income, income volatility, and typical payment intervals based on 90 days of historical data
3. WHEN income patterns show high variability (standard deviation exceeding 40% of mean), THE AI Agent SHALL classify the User as having irregular income
4. THE AI Agent SHALL predict next expected income date with a confidence interval based on historical payment patterns
5. THE Juggle System SHALL display income insights including 30-day income total and percentage of monthly income goal achieved

### Requirement 5

**User Story:** As a user preparing for upcoming expenses, I want Juggle to proactively alert me about potential cash flow shortfalls, so that I can take action before running out of money.

#### Acceptance Criteria

1. WHEN the AI Agent detects upcoming Financial Commitments within the next 30 days, THE Juggle System SHALL generate a Cash Flow Forecast comparing expected income against anticipated expenses
2. WHEN the Cash Flow Forecast indicates a potential Shortfall exceeding ₹500, THE Juggle System SHALL send a proactive alert to the User within 24 hours of detection
3. THE Juggle System SHALL display the alert prominently on the dashboard with the projected Shortfall amount and timing
4. THE alert SHALL include specific Financial Commitments contributing to the Shortfall with their respective amounts and dates
5. WHEN multiple Shortfalls are detected in different time periods, THE Juggle System SHALL prioritize alerts based on severity (amount) and proximity (date)

### Requirement 6

**User Story:** As a user facing a projected shortfall, I want Juggle to recommend a personalized savings plan, so that I can prepare for the expense without financial stress.

#### Acceptance Criteria

1. WHEN a Shortfall is identified, THE AI Agent SHALL generate a Micro-Savings Plan that distributes the required savings amount across available days until the expense date
2. THE Micro-Savings Plan SHALL calculate daily or weekly savings targets based on the User's income frequency and the time remaining
3. THE Juggle System SHALL present the recommendation in clear, actionable language specifying the savings amount, frequency, and duration
4. WHEN the User accepts a Micro-Savings Plan, THE Juggle System SHALL track progress and display remaining savings needed
5. THE AI Agent SHALL adjust the Micro-Savings Plan dynamically if new income is received or expenses change

### Requirement 7

**User Story:** As a user managing multiple bills, I want Juggle to track my upcoming bills and payment deadlines, so that I never miss a payment.

#### Acceptance Criteria

1. WHEN the User manually adds a bill, THE Juggle System SHALL store the bill name, amount, due date, and recurrence pattern
2. THE Juggle System SHALL display all bills due within the next 14 days on the dashboard with visual indicators for urgency
3. WHEN a bill due date is within 3 days, THE Juggle System SHALL send a reminder notification to the User
4. THE Juggle System SHALL allow the User to mark bills as paid and automatically update the Cash Flow Forecast
5. WHEN a recurring bill is marked as paid, THE Juggle System SHALL automatically create the next occurrence based on the recurrence pattern

### Requirement 8

**User Story:** As a user wanting to understand my financial health, I want Juggle to provide insights into my spending patterns, so that I can identify areas for improvement.

#### Acceptance Criteria

1. THE Juggle System SHALL display transaction insights for the last 7 days showing top spending categories with amounts and percentage of total spending
2. WHEN a spending category exceeds 150% of the User's historical average for that category, THE Juggle System SHALL highlight it as unusual spending
3. THE Juggle System SHALL compare current period spending against previous period spending and display the percentage change
4. THE AI Agent SHALL identify spending trends (increasing, decreasing, stable) for each category over the last 90 days
5. THE Juggle System SHALL provide visual representations (charts, progress bars) of spending patterns for quick comprehension

### Requirement 9

**User Story:** As a new user, I want to complete an onboarding process that sets up my financial profile, so that Juggle can provide relevant recommendations from day one.

#### Acceptance Criteria

1. WHEN a new User registers, THE Juggle System SHALL guide the User through account creation using Firebase Authentication within 60 seconds
2. THE onboarding flow SHALL prompt the User to connect at least one bank account before proceeding to the dashboard
3. THE onboarding flow SHALL request Google Calendar authorization with clear explanation of how calendar data will be used
4. WHEN onboarding is complete, THE Juggle System SHALL display a welcome dashboard with initial insights based on available data
5. THE Juggle System SHALL allow the User to skip optional steps and complete them later from settings

### Requirement 10

**User Story:** As a user concerned about data privacy, I want to control what data Juggle accesses and be able to delete my data, so that I maintain ownership of my personal information.

#### Acceptance Criteria

1. THE Juggle System SHALL provide a settings page where the User can view all connected data sources (bank accounts, calendar)
2. WHEN the User disconnects a data source, THE Juggle System SHALL immediately stop syncing data from that source
3. THE Juggle System SHALL provide a data deletion option that removes all User data including transactions, calendar events, and AI learning history within 48 hours
4. THE Juggle System SHALL display a privacy policy explaining what data is collected, how it is used, and how it is protected
5. THE Juggle System SHALL never share User financial data with third parties without explicit User consent
