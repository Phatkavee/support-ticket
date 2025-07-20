# 🎫 Support Ticket System

ระบบจัดการ Support Ticket แบบครบครัน พัฒนาด้วย Next.js 15, TypeScript, และ TailwindCSS

## 🚀 Features

### 🎫 Ticket Management
- **Create Tickets**: Auto-generated ticket numbers (RHD-YYYYMMDD-XXXX format)
- **Status Tracking**: Open → In Progress → Resolved → Closed
- **Priority Levels**: Low, Medium, High, Critical
- **Categories**: Hardware, Software, Network, Security, Database, Other
- **File Attachments**: Support for images, documents, PDFs with drag-and-drop
- **Reporter Information**: Contact details for follow-up
- **Project Association**: Link tickets to specific projects

### 📊 Dashboard & Analytics
- Real-time ticket statistics
- SLA monitoring and alerts
- Priority distribution charts
- Status overview widgets
- Recent activity tracking

### 💬 Communication System
- **Comments**: Internal and external comments
- **File Sharing**: Attach files to comments
- **Change Logs**: Automatic tracking of all changes
- **Notifications**: Email and in-app notifications (placeholder)

### ⏰ SLA Management
- Configurable SLA deadlines by priority
- Visual SLA status indicators
- Overdue ticket alerts
- Response time tracking

### 📎 File Management
- **Multiple File Upload**: Support for multiple files per ticket
- **File Types**: Images (JPEG, PNG, GIF, WebP), Documents (PDF, DOC, DOCX, XLS, XLSX), Text files
- **File Size Limit**: 10MB per file
- **Preview & Download**: Direct file access with preview for images
- **Visual Indicators**: File attachment icons in ticket lists

### 🔄 Workflow Management
- Ticket assignment to suppliers/technicians
- Status change tracking
- Automated change logging
- Feedback collection system

## 🛠 Technology Stack

- **Frontend**: Next.js 15.3.5, React 19, TypeScript 5
- **Styling**: TailwindCSS 4, Radix UI Components
- **Icons**: Lucide React
- **Storage**: LocalStorage (Demo) - Ready for Supabase integration
- **State Management**: React Hooks

## 🚦 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
app/
├── (auth)/                 # Authentication pages
├── (dashboard)/           # Main application
│   ├── dashboard/         # Dashboard overview
│   ├── projects/         # Project management
│   └── tickets/          # Ticket management
├── api/
│   ├── projects/         # Project services
│   └── tickets/          # Ticket services
components/               # Reusable UI components
lib/                     # Utility functions
├── sla-utils.ts         # SLA calculations
├── ticket-utils.ts      # Ticket number generation
└── date-utils.ts        # Date formatting
types/                   # TypeScript type definitions
├── ticket.ts           # Ticket-related types
└── project.ts          # Project-related types
```

## 🎯 Usage

### Creating a New Ticket
1. Navigate to `/tickets/create`
2. Fill in reporter information
3. Select category and priority
4. Attach files if needed
5. Submit to generate auto ticket number

### Managing Tickets
- View all tickets in `/tickets`
- Filter by status, priority, category
- Click on ticket to view details
- Add comments and track changes
- Update status and assign to team members

### Dashboard Overview
- Real-time statistics
- SLA monitoring
- Recent activity
- Priority distribution

## 🔧 Configuration

### SLA Settings
Edit `lib/sla-utils.ts` to configure:
- Priority-based deadlines
- Business hours
- Holiday schedules

### File Upload Settings
Edit `app/(dashboard)/tickets/components/CreateTicketForm.tsx`:
- Maximum file size (currently 10MB)
- Allowed file types
- Upload validation rules

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

For production deployment:
1. Replace LocalStorage with proper database (Supabase recommended)
2. Configure file upload to cloud storage (AWS S3, Cloudinary)
3. Set up email notifications
4. Configure authentication system

## 📝 License

This project is licensed under the MIT License.
