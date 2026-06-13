# CRM Customer 360 - Documentation

This folder contains all documentation and related files for the CRM Customer 360 project.

## Structure

### `/xmind/`
Contains XMind mind map files for feature specifications and project planning.
- `CRM CUSTOMER 360 - Tính Năng Phiên Bản 5.0.xmind` - Main feature specification

### `/scripts/`
Python scripts for processing XMind files and generating structured data.
- `generate_xmind_data.py` - Generate structured data from XMind files
- `parse_xmind.py` - Parse XMind file content

### `/data/`
Generated JSON data extracted from XMind files.
- `xmind_content.json` - Structured content extracted from XMind files

## Public Documentation

PDF and image exports are stored in `/public/docs/` for web access:
- Mind map PDF: Available at `/docs/mind-map.pdf` in the web app

## Usage

1. **Edit XMind files** in `/xmind/` folder
2. **Run scripts** from `/scripts/` to generate data
3. **Generated data** will be saved to `/data/`
4. **Export PDFs** to `/public/docs/` for web access
