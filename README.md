# Server Manager

A modern, responsive, and secure web-based server management dashboard built with Next.js. Monitor system resources, manage Docker containers, control Cloudflare Tunnels, and access a web-based terminal—all from a single, beautiful interface.

![Dashboard Overview](dashboard_overview_1767944717250.png)

## Features

*   **System Monitoring:** Real-time visualization of CPU usage, Memory, Disk Space, and Server Uptime.
*   **Docker Management:** View, start, stop, restart, and remove Docker containers. Monitor container status and image details.
*   **Web Terminal:** Fully functional, secure web-based terminal (using WebSocket) to execute shell commands directly on your server.
*   **Cloudflare Tunnels:** Manage and monitor your Cloudflare Tunnel configurations and status.
*   **Responsive Design:** Optimized for both desktop and mobile devices with a sleek "cyberpunk" aesthetic.
*   **Secure:**
    *   Protected by password authentication.
    *   HttpOnly cookies for session management.
    *   DevTools blocking (client-side) to deter casual inspection.
    *   Execution of arbitrary commands is protected behind authentication.

## Screenshots

### 🖥️ Dashboard
Get a quick overview of your server's health.
![Dashboard](dashboard_overview_1767944717250.png)

### 🐳 Docker Management
Easily manage your containers.
![Docker](docker_management_1767944737772.png)

### 🌐 Cloudflare Tunnels
Monitor your tunnel connections.
![Tunnels](tunnels_page_1767944775601.png)

### ⌨️ Web Terminal
Direct ssh-like access from your browser.
![Terminal](terminal_page_1767944834697.png)

### 📱 Mobile View
Fully responsive interface for management on the go.
![Mobile Sidebar](mobile_sidebar_open_1767944894291.png)

## Technology Stack

*   **Framework:** Next.js 14+ (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + CSS Modules (Custom Cyberpunk Theme)
*   **Backend:** Node.js (integrated via Next.js API Routes)
*   **Real-time:** Socket.IO (for Terminal)
*   **System Interactions:** `node-pty` (Terminal), `dockerode` (Docker), `systeminformation` (Stats)

## Getting Started

### Prerequisites

*   Node.js 18+
*   Docker (if using Docker features)
*   Cloudflare Tunnel (cloudflared) installed (if using Tunnel features)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/server-manager.git
    cd server-manager
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    # Password for login
    AUTH_PASSWORD=YourSecurePassword
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

### Deployment (Production)

1.  **Build the application:**
    ```bash
    npm run build
    ```

2.  **Start the server:**
    ```bash
    npm start
    ```
    Or use PM2 for process management:
    ```bash
    pm2 start npm --name "server-manager" -- start
    ```

## Security Note

This application provides root-level access (via terminal and docker controls) to the underlying server. Ensure you:
*   Use a strong `AUTH_PASSWORD`.
*   Run this application behind a secure reverse proxy (like Nginx or Cloudflare Tunnel) with HTTPS.
*   Do not expose the raw port (3000/8001) directly to the internet without protection.

## License

[MIT](LICENSE)
