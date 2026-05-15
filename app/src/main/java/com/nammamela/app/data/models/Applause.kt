package com.nammamela.app.data.models

import com.google.firebase.firestore.DocumentId

data class Applause(
    @DocumentId val id: String = "",
    val playId: String? = null,
    val actorId: String? = null,
    val userId: String = "",
    val userName: String = "Fan",
    val comment: String = "",
    val claps: Int = 0,
    val createdAt: Long = System.currentTimeMillis()
)
