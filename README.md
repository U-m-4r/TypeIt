# TypeIt - Typing Speed Tester

A web-based typing speed test application with dynamic content generation, user authentication, and performance tracking.

## Features

- **Dynamic Text Generation**: Fetch category-specific typing content (Technology, Sports, Anime, Horror Story, Science, History, Travel, Food)
- **Difficulty Levels**: Easy, Medium, and Hard modes with progressively complex text
- **Real-time Statistics**: Live WPM (Words Per Minute) and accuracy tracking
- **Performance Analytics**: Visual graph showing word-by-word timing data
- **User Accounts**: Login/Register system with persistent user data
- **Leaderboard**: View top 10 users by best WPM score
- **Theme Support**: Dark, Light, and Colorful themes
- **Countdown Animation**: 3-2-1 countdown before each test starts

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Data Storage**: JSON file-based storage (users.txt)
- **Canvas API**: For rendering performance graphs

## Installation

1. Clone the repository:

```bash
git clone https://github.com/U-m-4r/TypeIt.git
cd TypeIt
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

4. Open your browser and navigate to:

```
http://localhost:3000
```

## Project Structure

```
TypeIt/
├── public/
│   ├── app.js          # Frontend logic and event handlers
│   ├── index.html      # Main HTML structure
│   ├── style.css       # Styling and themes
│   └── logo.jpg        # Application logo
├── server.js           # Express server and API endpoints
├── users.txt           # User data storage
├── package.json        # Project dependencies
└── README.md          # This file
```

## API Endpoints

### POST `/api/login`

Login or register a user

- **Request**: `{ username, password }`
- **Response**: `{ ok: true, user: { username, password, bestWpm } }`

### POST `/api/update`

Update user's best WPM score

- **Request**: `{ username, bestWpm }`
- **Response**: `{ ok: true }`

### GET `/api/users`

Fetch all users for leaderboard

- **Response**: `{ username: { username, password, bestWpm }, ... }`

### POST `/api/text`

Get typing practice text by category and difficulty

- **Request**: `{ category, difficulty }`
- **Response**: `{ text: "sample text..." }`

## Usage

1. **Register/Login**: Enter a username and password
2. **Select Category**: Choose from 8 different content categories
3. **Choose Difficulty**: Toggle between Easy, Medium, or Hard
4. **Start Test**: Click "Start" to begin (3-2-1 countdown)
5. **Type**: Type the displayed text into the textarea
6. **Submit**: Press Enter to finish and see results
7. **View Stats**: See WPM, accuracy, timing graph, and slowest word

## Performance Metrics

- **WPM**: Words Per Minute - calculated as (words typed / time elapsed in minutes)
- **Accuracy**: Percentage of words typed correctly
- **Slowest Word**: Word with the longest time to complete
- **Word Timing Graph**: Visual representation of time spent on each word

## Supported Categories

- **Technology**: AI, computing, innovation topics
- **Sports**: Athletic training and competition
- **Anime**: Animation and Japanese media
- **Horror Story**: Suspenseful and spooky narratives
- **Science**: Scientific discovery and research
- **History**: Historical events and civilizations
- **Travel**: Exploration and journey experiences
- **Food**: Culinary traditions and cooking

## Difficulty Levels

- **Easy**: 1-2 simple sentences, basic vocabulary
- **Medium**: 2-3 longer sentences with moderate complexity
- **Hard**: Complex sentences with advanced concepts and technical terms

## Themes

- **Dark**: Default dark theme (optimal for extended typing sessions)
- **Light**: Clean light theme with good contrast
- **Colorful**: Vibrant themed interface

## Requirements

- Node.js v12 or higher
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Future Enhancements

- [ ] Database integration (MongoDB, PostgreSQL)
- [ ] Real LLM API integration for unlimited text generation
- [ ] Multiplayer typing races
- [ ] Custom text upload
- [ ] Detailed statistics and progress tracking
- [ ] Dark mode auto-detection
- [ ] Mobile responsive optimization
- [ ] Sound effects and notifications

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Author

**U-m-4r** - [GitHub Profile](https://github.com/U-m-4r)

## Acknowledgments

- Inspired by popular typing speed test applications
- Built with vanilla JavaScript for simplicity and performance
- Community feedback and contributions welcome

## Contact

For questions, issues, or suggestions, please open an issue on GitHub or contact the author.

---

**Last Updated**: December 2025
