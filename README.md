# 🚗 Car Parking Management System

A fun and user-friendly full-stack parking management system built with **Next.js**, **MongoDB**, and **Tailwind CSS**. This app supports:

- 🎫 User vehicle registration and ticket generation
- 🅿️ Parking spot selection and allocation
- 🧾 Real-time ticket display and unpark cost calculation
- 🖨️ Printable ticket summaries
- 🛠️ Admin dashboard for managing lots, levels, and spots

---

## 📦 Features

### 👤 Users
- Add a new vehicle
- Select a parking level and park
- Get a digital ticket with parking details
- Unpark to see total cost
- Print or save ticket as PDF

### 🧑‍💼 Admin
- Manage Parking Lots and Levels
- Generate spots for each level
- Monitor all tickets via dashboard

---

## 🚀 Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/your-username/cute-parking.git
cd car-parking
```

### 2. Install Dependencies
```bash
npm install 
```

### 3. Configure MongoDB
Create a `.env.local` file:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/parking_db
```

### 4. Run the Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`

---

## 📁 Project Structure
```
/pages
  index.tsx               # Entry point
  user.tsx                # User vehicle entry
  findparkingspot.tsx     # Choose level and park
  ticket/[ticketId].tsx   # View and print ticket
  admin/                  # Admin dashboards

/pages/api
  /user                   # Create ticket, unpark
  /tickets                # Fetch ticket by ID
  /admin                  # Admin tools (generate spots)

/models
  Vehicle.ts
  Ticket.ts
  ParkingLot.ts
  ParkingLevel.ts
  ParkingSpot.ts
```

---

## 🧪 Example Flow
1. User enters from home page → `/user`
2. Creates vehicle → Redirect to `/findparkingspot`
3. Selects level → Ticket generated → Redirects to `/ticket/[id]`
4. Can unpark and print ticket

---

## 📸 Screenshot
> Include a cute screenshot here of the homepage or ticket page.

---

## 💖 Credits
- Built with love by the Kasetsart University team 🇹🇭
- Uses [Lucide Icons](https://lucide.dev/) and [Framer Motion](https://www.framer.com/motion/)

---

## 📃 License
MIT License — Free to use and modify!

