package com.nammamela.app.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.nammamela.app.data.models.Applause
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DramaRepository @Inject constructor(
    private val firestore: FirebaseFirestore
) {
    fun getApplause(): Flow<List<Applause>> = callbackFlow {
        val subscription = firestore.collection("applause")
            .orderBy("createdAt")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val applauseList = snapshot.toObjects(Applause::class.java)
                    trySend(applauseList)
                }
            }
        awaitClose { subscription.remove() }
    }

    suspend fun addApplause(applause: Applause) {
        firestore.collection("applause").add(applause).await()
    }

    suspend fun incrementClaps(id: String, playId: String?, actorId: String?) {
        if (id.isEmpty()) return
        firestore.collection("applause").document(id)
            .update("claps", com.google.firebase.firestore.FieldValue.increment(1))
            .await()
    }
}
