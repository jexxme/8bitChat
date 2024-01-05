# Changelog

All notable changes to the 8bitChat project will be documented in this file.

## [0.0.2] - 2024-01-05

### Added
- Privacy policy and terms of service pages with footer links.
- JSON-LD schema for the 8bitChat application.
- Meta tags for social media sharing and schema markup.
- Photo sharing functionality in chat.
- Audio mute/unmute functionality and a settings section.
- Join and pop sound effects for chat events.

### Changed
- Updated social media image URLs in index.html for Open Graph (`og:image`) and Twitter Cards (`twitter:image`).
- Updated custom.css styles to improve the visual design and user interface.
- Refactored chat.js to improve message display and user identification.
- Added responsive styles for smaller screens and adjusted font sizes for better readability.
- Updated the logo, increased font sizes, and modified legal links in the index.html for clearer branding.
- Updated CSS and JavaScript files to enhance the functionality of the info button and legal links modal.
- Compressed images before uploading to optimize performance and reduce data usage.

### Fixed
- Fixed page titles and links to ensure accurate navigation and branding.
- Updated audio context unlock to correctly handle audio playback on various devices.

## [0.0.1] - 2024-01-02

### Added
- Initial setup of the 8bitChat application with base chat functionality.
- Name input modal for new users and timestamps for messages.
- Pop-in animation for chat messages and user join messages.
- Overlay and show/hide functionality for nameModal.
- Enter key event listener for sending messages.
- Responsive styles for the chat room.
- Audio context unlock on user interaction and play sound effects.
- 8bitChat README.md file and LICENSE.
- Google Analytics tracking code.

### Changed
- Refactored chat functionality to improve user experience.
- Updated custom.css with new styles for username display and message container.
- Adjusted height and logo size in custom.css for better visual appearance.
- Updated logo size and height in readme.md for brand consistency.

### Fixed
- Fixed an issue with misattributed messages in the chat application.

### Technical
- Added python-dotenv to requirements.txt for environment variable management.
- Refactored socketio event handling in routes.py for better code organization.
- Merged changes from the main branch to incorporate updates and maintain codebase consistency.

