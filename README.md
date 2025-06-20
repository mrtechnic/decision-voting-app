#  Collaborative Decision Voting App

A modern web application that allows teams or groups to make collaborative decisions by creating rooms, voting anonymously or as registered users, and viewing real-time vote results. Designed for fairness, flexibility, and ease of use.

---

##  Features

- User authentication (JWT-based)
- Room creation with invite codes
- Invite others to vote via code
- Authenticated or anonymous voting
- Real-time vote count per option
- Prevent duplicate voting via fingerprinting
- Clean separation of frontend & backend

---

## Thought Process

This app was built to solve the following challenges in group decision-making:

- Difficulty in gathering input from a distributed team
- Lack of structured voting in discussions
- Need for accountability while supporting anonymous votes
- Preventing manipulation (e.g., duplicate votes)
- Enabling flexible decision cycles (via deadlines)

We designed the app with a modular architecture, secure authentication, and simple UX that allows both technical and non-technical users to use it effectively.

---

##  Architecture

###  Frontend (`frontend/`)

| React + TypeScript | Component-based UI with type safety          |
| React Router       | Client-side routing                          |
| Axios              | API communication                            |
| TailwindCSS        | Modern utility-first styling                 |
| Context API        | Auth management                              |


---

### Backend (`backend/`)

| Node.js + Express  | RESTful API with middleware support          |
| TypeScript         | Strong typing throughout backend             |
| MongoDB + Mongoose | Flexible document-based storage              |
| JWT                | Secure authentication                        |
| Bcrypt             | Password hashing                             |



---

##  Authentication Strategy

- **JWT-based Auth**: User receives a token on login/register.
- **Private Routes**: Middleware `authenticateToken` guards certain routes.


---

##  Limitations


| Anonymous Abuse                   | Users can bypass fingerprinting using VPN or private mode. |
| Time Zone Issues                  | Deadline logic is server-based, but user confusion may occur. |
| No Vote Change                    | Once cast, votes cannot be edited or deleted. |
| No Role Management                | All users are equal; no moderators or admins per room. |
| No Real-Time Sockets              | Votes are fetched per request (can be improved with WebSockets). |
| No Auto Cleanup                   | Old rooms and votes persist without scheduled cleanup. |
| No Contextual Discussion          | Votes are standalone; no commenting or reasoning field. |
| Client-Side Token Storage        | Storing tokens in localStorage can be insecure if not mitigated. |

---

##  Getting Started

###  Prerequisites
- Node.js & npm
- MongoDB (local or Atlas)
- `pnpm`, `yarn`, or `npm` for installing packages

### 1. Clone the Repository
```bash
git clone https://github.com/mrtechnic/decision-voting-app.git
cd decision-voting-app





