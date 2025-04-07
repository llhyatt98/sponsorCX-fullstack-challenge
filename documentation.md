# SponsorCX Fullstack Challenge Documentation

## Overview

This project implements a React frontend with an Express SQLite backend for managing organization sponsorship deals. The solution allows organizations to view their accounts and the associated deals, with filtering capabilities for status and year.

## Running the Application

1. Start the backend:
   ```bash
   cd server
   npm install
   npm run seed  # Populate the database with test data
   npm run dev   # Start the development server
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Technical Approach

### Backend Implementation

1. **Database**:
   - Created a relational model with organizations, accounts, and deals
   - Implemented proper relationships with foreign key constraints
   - Added a seed.ts script for populating initial seed data

2. **API Design**:
   - Developed a RESTful API for retrieving organization data
   - Implemented filtering by status and year in the backend for efficient data retrieval
   - Structured response data to optimize for frontend rendering

3. **Data Structure**:
   - Organizations have many accounts
   - Accounts have many deals
   - Each deal has attributes like value, status, start/end dates

### Frontend Implementation

1. **Component Structure**:
   - Main `OrganizationDeals` component manages the organization list and filters
   - Nested `AccountDeals` component handles the account-level display
   - Separated API calls into a dedicated service layer

2. **State Management**:
   - Used React's useState and useEffect for local state management
   - Implemented lazy loading of deals data only when organizations are expanded
   - Created a system to track expanded states for multiple accordions

3. **UI Considerations**:
   - Added visual feedback for loading states
   - Implemented responsive design using MUI's responsive props
   - Enhanced status displays with colored chips
   - Added summary statistics at organization and account levels

## UI Design

### Why Accordion UI?

The accordion design was chosen primarily because it effectively represents the hierarchical data structure (organizations → accounts → deals) while providing a clean, space-efficient interface. It allows users to focus on specific data segments and progressively disclose information, preventing overwhelming users with too much information at once. While alternatives like tabs offer faster navigation, accordions better handle nested data relationships.

## Design Decisions

1. **Backend Filtering**: Implemented filtering on the backend rather than frontend to reduce data transfer and improve performance.

2. **Multiple Accordions**: Modified the UI to allow multiple accordions to be open simultaneously for better comparison capabilities.

3. **Real-time Filter Updates**: Implemented immediate filter application using useEffect for a responsive user experience.

5. **Responsive Layout**: Designed the UI to work well on various screen sizes using responsive breakpoints. 