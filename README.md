# 🎭 Namma-Mela
 Digital Rural Drama Box Office Application
Namma-Mela is an Android application developed using Kotlin and Jetpack Compose to modernize traditional village drama fairs (Company Nataka). The app acts as a digital theater management and seat booking platform that helps audiences view drama information, reserve seats, and interact with performers digitally.

# 📌 Problem Statement
    
Village Melas and traditional drama troupes often lack organized booking systems. Audiences travel long distances without knowing seat availability, cast details, or performance schedules.
Namma-Mela solves this problem by introducing a digital box-office system for rural theater communities.

# 🚀 Features

* 🎟️ Digital Seat Reservation System
* 🎭 Tonight’s Drama Information
* 👥 Cast Member Profiles
* 🪑 Grid-Based Seat Layout
* 💬 Fan Wall for Audience Comments
* 🖼️ Drama Posters
* 💾 Persistent Booking using Room Database
* 📱 Theatrical UI Design
  

# 🛠️ Tech Stack

| Technology        | Purpose                 |
| ----------------- | ----------------------- |
| Kotlin            | Android Development     |
| Jetpack Compose   | UI Development          |
| Room Database     | Local Data Storage      |
| MVVM Architecture | App Architecture        |
| Coil / Glide      | Image Loading           |
| Android Studio    | Development Environment |


# 📂 Project Structure

```plaintext
# 📂 Namma-Mela Complete Project Structure

```plaintext id="gk2p9u"
NammaMela/
│
├── .gradle/
├── .idea/
├── app/
│   │
│   ├── build/
│   ├── libs/
│   │
│   ├── src/
│   │   ├── androidTest/
│   │   │
│   │   ├── test/
│   │   │
│   │   └── main/
│   │       │
│   │       ├── AndroidManifest.xml
│   │       │
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── example/
│   │       │           └── nammamela/
│   │       │
│   │       │               ├── MainActivity.kt
│   │       │               ├── NammaMelaApp.kt
│   │       │               │
│   │       │               ├── data/
│   │       │               │   │
│   │       │               │   ├── local/
│   │       │               │   │   │
│   │       │               │   │   ├── AppDatabase.kt
│   │       │               │   │   ├── SeatDao.kt
│   │       │               │   │   ├── DramaDao.kt
│   │       │               │   │   ├── CommentDao.kt
│   │       │               │   │   │
│   │       │               │   │   ├── entity/
│   │       │               │   │   │   ├── SeatEntity.kt
│   │       │               │   │   │   ├── DramaEntity.kt
│   │       │               │   │   │   └── CommentEntity.kt
│   │       │               │   │
│   │       │               │   ├── model/
│   │       │               │   │   ├── Drama.kt
│   │       │               │   │   ├── CastMember.kt
│   │       │               │   │   ├── Seat.kt
│   │       │               │   │   └── Comment.kt
│   │       │               │   │
│   │       │               │   ├── repository/
│   │       │               │   │   ├── SeatRepository.kt
│   │       │               │   │   ├── DramaRepository.kt
│   │       │               │   │   └── CommentRepository.kt
│   │       │               │
│   │       │               ├── ui/
│   │       │               │   │
│   │       │               │   ├── theme/
│   │       │               │   │   ├── Color.kt
│   │       │               │   │   ├── Theme.kt
│   │       │               │   │   └── Type.kt
│   │       │               │   │
│   │       │               │   ├── navigation/
│   │       │               │   │   └── NavGraph.kt
│   │       │               │   │
│   │       │               │   ├── screens/
│   │       │               │   │   │
│   │       │               │   │   ├── splash/
│   │       │               │   │   │   └── SplashScreen.kt
│   │       │               │   │   │
│   │       │               │   │   ├── home/
│   │       │               │   │   │   └── HomeScreen.kt
│   │       │               │   │   │
│   │       │               │   │   ├── booking/
│   │       │               │   │   │   ├── SeatBookingScreen.kt
│   │       │               │   │   │   ├── BookingSuccessScreen.kt
│   │       │               │   │   │   └── SeatLayout.kt
│   │       │               │   │   │
│   │       │               │   │   ├── cast/
│   │       │               │   │   │   └── CastScreen.kt
│   │       │               │   │   │
│   │       │               │   │   ├── fanwall/
│   │       │               │   │   │   └── FanWallScreen.kt
│   │       │               │   │   │
│   │       │               │   │   ├── admin/
│   │       │               │   │   │   ├── AdminDashboard.kt
│   │       │               │   │   │   ├── AddDramaScreen.kt
│   │       │               │   │   │   └── ManageSeatsScreen.kt
│   │       │               │   │
│   │       │               │   ├── components/
│   │       │               │   │   ├── DramaCard.kt
│   │       │               │   │   ├── CastCard.kt
│   │       │               │   │   ├── SeatItem.kt
│   │       │               │   │   ├── CommentCard.kt
│   │       │               │   │   └── TopBar.kt
│   │       │               │
│   │       │               ├── viewmodel/
│   │       │               │   ├── HomeViewModel.kt
│   │       │               │   ├── SeatViewModel.kt
│   │       │               │   ├── CastViewModel.kt
│   │       │               │   ├── FanWallViewModel.kt
│   │       │               │   └── AdminViewModel.kt
│   │       │               │
│   │       │               ├── utils/
│   │       │               │   ├── Constants.kt
│   │       │               │   ├── Extensions.kt
│   │       │               │   └── DummyData.kt
│   │       │               │
│   │       │               └── di/
│   │       │                   └── AppModule.kt
│   │       │
│   │       └── res/
│   │           │
│   │           ├── drawable/
│   │           │   ├── drama_poster.png
│   │           │   ├── theater_bg.png
│   │           │   └── app_logo.png
│   │           │
│   │           ├── mipmap/
│   │           │
│   │           ├── values/
│   │           │   ├── colors.xml
│   │           │   ├── strings.xml
│   │           │   └── themes.xml
│   │           │
│   │           └── font/
│   │               └── theatrical_font.ttf
│   │
│   ├── build.gradle.kts
│   └── proguard-rules.pro
│
├── gradle/
│
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
├── gradlew
├── gradlew.bat
│
├── README.md
├── LICENSE
└── .gitignore
```

# 📱 App Modules

## 🏠 Home Screen

Displays:

* Drama poster
* Drama title
* Show timing
* Duration

## 🎭 Cast Screen

Shows:

* Lead actors
* Comedians
* Singers
* Supporting artists

## 🪑 Seat Booking Screen

Features:

* Seat availability
* Grid-based booking system
* Real-time seat updates

## 💬 Fan Wall

Users can:

* Leave applause comments
* Share feedback
* Support performers

---

# 🧠 Architecture

The application follows the **MVVM Architecture Pattern**.

### Layers:

* UI Layer
* ViewModel Layer
* Data Layer

---

# 💾 Database

The app uses **Room Database** for:

* Seat reservation persistence
* Drama details
* Fan wall comments

---

# 🎨 UI Theme

Namma-Mela uses a theatrical UI design with:

* Dark backgrounds
* Gold and red accents
* Bold typography
* Traditional cultural aesthetics

---

# 📌 Future Enhancements

* 💳 Online Payment Integration
* 🔔 Push Notifications
* 🎫 QR Code Tickets
* ☁️ Firebase Backend
* 🌐 Multi-language Support
* 📊 Admin Analytics Dashboard
* 📺 Live Drama Streaming

---

# 🎯 Impact Goals

* Preserve traditional rural theater culture
* Digitize village entertainment systems
* Improve audience experience
* Support local drama communities

---

# 🧪 Testing

The project includes:

* UI Testing
* Database Testing
* Seat Reservation Validation
* User Acceptance Testing

---

# 📦 Installation

## Clone Repository

```bash
https://github.com/sharathycse2022-design/Namma_Mela
```

## Open Project

Open the project in:

* Android Studio

## Run Application

* Sync Gradle
* Connect Android device/emulator
* Click Run ▶️

---

# 📸 Screenshots

*Add app screenshots here*
<img width="484" height="846" alt="image" src="https://github.com/user-attachments/assets/d0966813-d254-4f48-8e87-a4c6934a7ecc" />
<img width="490" height="846" alt="image" src="https://github.com/user-attachments/assets/a9bda46b-17e8-45e8-8120-d5f7326f9000" />
<img width="472" height="826" alt="image" src="https://github.com/user-attachments/assets/264ef238-5918-45a0-ab00-133f71de022a" />
<img width="470" height="831" alt="image" src="https://github.com/user-attachments/assets/76424c9d-d099-4ccc-973a-c209a55742fe" />
<img width="481" height="834" alt="image" src="https://github.com/user-attachments/assets/1164afdd-8a89-4038-8ab1-137228ac92a1" />
<img width="485" height="826" alt="image" src="https://github.com/user-attachments/assets/fc39d5a5-856a-43f8-a128-d52585eafbf6" />

---

# 🤝 Contributors

* Sharath Y
* MindMatrix Internship Project

---

# 📄 License

This project is developed for educational and cultural preservation purposes.

---

# ❤️ Cultural Preservation Through Technology

Namma-Mela combines modern Android development with traditional village drama culture to create a meaningful digital experience for rural communities.
