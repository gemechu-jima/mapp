bingo-mobile/
├── src/
│   ├── app/                         # Root navigation and screens
│   │   ├── _layout.tsx              # Root layout and providers
│   │   ├── index.tsx                # Initial route / redirect
│   │   │
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   │
│   │   ├── (player)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx            # Player dashboard
│   │   │   ├── games.tsx
│   │   │   ├── reservations.tsx
│   │   │   ├── draws.tsx
│   │   │   └── profile.tsx
│   │   │
│   │   └── (admin)/
│   │       ├── _layout.tsx
│   │       ├── index.tsx            # Admin dashboard
│   │       ├── users.tsx
│   │       ├── games.tsx
│   │       ├── reservations.tsx
│   │       ├── draws.tsx
│   │       └── winners.tsx
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── common/
│   │   │   ├── AppButton.tsx
│   │   │   ├── AppInput.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── games/
│   │   │   ├── GameCard.tsx
│   │   │   └── NumberBoard.tsx
│   │   ├── reservations/
│   │   │   └── ReservationCard.tsx
│   │   └── draws/
│   │       └── DrawPanel.tsx
│   │
│   ├── constants/                   # App-wide constants
│   │   └── config.ts
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── useAuth.ts
│   │
│   ├── api/                         # HTTP client and API configuration
│   │   ├── axios.ts
│   │   └── endpoints.ts
│   │
│   ├── context/                     # Global React state
│   │   └── AuthContext.tsx
│   │
│   ├── services/                    # Backend API operations
│   │   ├── AuthService.ts
│   │   ├── GameService.ts
│   │   ├── NumberService.ts
│   │   ├── ReservationService.ts
│   │   ├── DrawService.ts
│   │   └── UserService.ts
│   │
│   ├── types/                       # TypeScript models
│   │   ├── user.ts
│   │   ├── game.ts
│   │   ├── number.ts
│   │   ├── reservation.ts
│   │   └── draw.ts
│   │
│   ├── i18n/                        # Multilanguage configuration
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── en/translation.json
│   │       ├── am/translation.json
│   │       └── om/translation.json
│   │
│   └── utils/                       # Shared helper functions
│       ├── errors.ts
│       └── formatDate.ts
│
├── assets/                          # Images, fonts, icons
├── app.json
├── package.json
├── tsconfig.json
└── .env

Player
1. Dashboard
2. Available Games
3. Game Details
4. My Reservations
5. My Tickets
6. Number Selection
7. Live Bingo Draw
8. Game Results
9. Win History
10. Notifications
11. Wallet
12. Transaction History
13. Profile
14. Settings
15. Help & Support
Admin
1. Dashboard
2. Manage Games
3. Create Game
4. Manage Players
5. Manage Reservations
6. Manage Bingo Numbers
7. Manage Live Draws
8. Manage Game Results
9. Manage Winners
10. Manage Payments
11. Manage Transactions
12. Reports & Analytics
13. Notifications Management
14. Manage Complaints
15. System Settings
16. Audit Logs
17. Admin Profile
18. Help & Support