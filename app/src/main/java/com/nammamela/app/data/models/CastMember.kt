package com.nammamela.app.data.models

import com.google.firebase.firestore.DocumentId

data class CastMember(
    @DocumentId val id: String = "",
    val name: String = "",
    val role: String = "",
    val photoUrl: String = "",
    val applauseCount: Int = 0,
    val bio: String = ""
)
