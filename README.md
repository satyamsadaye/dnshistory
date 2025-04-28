# DNS History Lookup

A modern web application to track and analyze DNS changes over time. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Search DNS history for any domain
- View historical NS record changes
- Beautiful, responsive UI with dark mode support
- Real-time DNS lookup results
- Detailed change tracking and visualization

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **API Integration**: DNS History API

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/satyamsadaye/dnshistory.git
   cd dnshistory
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Create a `.env` file in the root directory and add your DNS API key:
   ```env
   DNS_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `DNS_API_KEY`: Your DNS API key from the provider

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 