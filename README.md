# PDF & Image Merger

A secure, client-side application to combine PDFs and Images into a single PDF file.

## Features

- **Merge PDFs**: Combine multiple PDF files into one.
- **Embed Images**: Add JPG, PNG, and TIFF images to your PDF.
- **Reorder Files**: Drag and drop or use up/down arrows to change the order of files.
- **Client-Side Processing**: All processing happens in your browser. No files are uploaded to any server.
- **Secure & Private**: Your data never leaves your device.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (or yarn/pnpm)

### Installation

1. Clone the repository (if applicable) or download the source code.
2. Install dependencies:

   ```bash
   npm install
   ```

### Running the App

To start the development server:

```bash
npm run dev
```

Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

## Technologies Used

- **React**: UI library.
- **Vite**: Build tool and development server.
- **TypeScript**: Type safety.
- **pdf-lib**: PDF manipulation library.
- **lucide-react**: Icons.
- **Tailwind CSS**: Styling (via CDN or inline styles - *Note: The current setup uses inline styles and standard CSS, but the classes suggest Tailwind usage. Ensure Tailwind is configured if you want to use utility classes fully, or stick to the provided CSS.*)

## License

See the [LICENSE](LICENSE) file for details.
