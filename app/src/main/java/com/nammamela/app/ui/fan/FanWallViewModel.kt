package com.nammamela.app.ui.fan

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.nammamela.app.data.models.Applause
import com.nammamela.app.data.models.CastMember
import com.nammamela.app.data.repository.DramaRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FanWallViewModel @Inject constructor(
    private val repository: DramaRepository,
    private val auth: FirebaseAuth
) : ViewModel() {

    val applause: StateFlow<List<Applause>> = repository.getApplause()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    fun sendApplause(comment: String, actorId: String? = null, playId: String? = null) {
        val user = auth.currentUser ?: return
        viewModelScope.launch {
            val newApplause = Applause(
                userId = user.uid,
                userName = user.displayName ?: "Fan",
                comment = comment,
                actorId = actorId,
                playId = playId
            )
            repository.addApplause(newApplause)
        }
    }

    fun clap(applause: Applause) {
        viewModelScope.launch {
            repository.incrementClaps(applause.id, applause.playId, applause.actorId)
        }
    }
}
