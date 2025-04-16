
# ⚡ WebLN Lightning Web Application

A modern React application showcasing WebLN integration for Bitcoin Lightning Network micropayments with six core functionalities: sendPayment, keysend, pay-per-scroll, wallet info, invoice generation, and Lightning Address payments.

## Overview

This project demonstrates how to integrate Bitcoin Lightning Network payments into web applications using WebLN. It provides a clean, intuitive interface for users to interact with Lightning wallets like Alby, enabling instant micropayments directly from the browser.

## Features

- **Wallet Connection** - Connect to any WebLN-compatible wallet (e.g., Alby browser extension)
- **Wallet Information** - Display details about the connected Lightning wallet
- **Send Payment** - Process Lightning invoices (BOLT11 format)
- **Keysend Payment** - Send direct payments to nodes without requiring invoices
- **Generate Invoice** - Create Lightning invoices with custom amounts and memos
- **Lightning Address Payments** - Send payments to Lightning addresses (user@domain.com format)
- **Pay-per-scroll Content** - Innovative micropayment system that sends 1 sat per content section
- **Real-time USD conversion** - Shows equivalent USD value for sat amounts

## Tech Stack

- **Frontend:** React with TypeScript
- **UI Components:** Tailwind CSS, Radix UI components
- **Server:** Express.js
- **Build Tools:** Vite, ESBuild
- **Additional Libraries:** 
  - QR code generation and scanning
  - Lightning payment processing
  - WebLN integration

## Project Structure

```
Lightning/
├── client/               # Frontend React application
│   ├── src/              # Source code
│   │   ├── components/   # UI components
│   │   ├── contexts/     # React contexts (WebLN provider)
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Application pages
│   │   └── types/        # TypeScript type definitions
├── server/               # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data storage utilities
│   └── vite.ts           # Vite configuration for development
└── shared/               # Shared code between client and server
    └── schema.ts         # Data schemas
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A WebLN-compatible wallet (like [Alby](https://getalby.com))

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/nyssaleo/lightning.git
   cd lightning
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Usage

1. Install the Alby browser extension from [getalby.com](https://getalby.com)
2. Set up your Lightning wallet in Alby
3. Visit the application and click "Connect Wallet"
4. Explore the different WebLN functionalities:
   - View your wallet information
   - Send and receive payments
   - Experience pay-per-scroll content

## Development

For local development with cross-platform compatibility:

```
npm run dev
```

This uses `cross-env` to set the NODE_ENV variable properly across different operating systems.

## Building for Production

```
npm run build
npm start
```


## Acknowledgements

- [Alby](https://getalby.com) for their WebLN provider and tools
- [WebLN Specification](https://webln.dev/)
- [Bitcoin Lightning Network](https://lightning.network/)
