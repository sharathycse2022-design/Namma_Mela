package com.nammamela.app.viewmodel

import androidx.lifecycle.ViewModel
import com.nammamela.app.model.Event
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class EventViewModel : ViewModel() {
    private val _events = MutableStateFlow<List<Event>>(emptyList())
    val events: StateFlow<List<Event>> = _events.asStateFlow()

    init {
        loadEvents()
    }

    private fun loadEvents() {
        _events.value = listOf(
            Event(
                id = 1,
                title = "Mookajjiya Kanasugalu",
                description = "A legendary tale of wisdom and dreams based on Kota Shivaram Karanth's masterpiece. Experience the layers of human existence through the visions of an elderly woman.",
                time = "6:30 PM",
                venue = "Main Stage",
                category = "Drama"
            ),
            Event(
                id = 2,
                title = "Malegalalli Madumagalu",
                description = "An epic forest romance exploring the lives and loves of people in the Malnad region. A spectacular outdoor performance that spans across multiple settings.",
                time = "7:00 PM",
                venue = "Open Air Theater",
                category = "Epic"
            ),
            Event(
                id = 3,
                title = "Sattavara Neralu",
                description = "A philosophical exploration of existence and the thin line between life and death. A thought-provoking performance that has defined Kannada theater for decades.",
                time = "5:45 PM",
                venue = "Studio Stage",
                category = "Philosophy"
            ),
            Event(
                id = 4,
                title = "Tughlaq",
                description = "Girish Karnad's historic masterpiece about the idealistic but misguided 14th-century Sultan of Delhi. A play about politics, madness, and tragedy.",
                time = "6:15 PM",
                venue = "Main Theatre",
                category = "Historical"
            ),
            Event(
                id = 5,
                title = "Jokumaraswamy",
                description = "A folk-based drama that explores fertility, power, and the struggle of the common man. Rich with music and vibrant performances.",
                time = "7:30 PM",
                venue = "Village Green",
                category = "Folk"
            ),
            Event(
                id = 6,
                title = "Hayavadana",
                description = "Another classic by Girish Karnad exploring the theme of identity and the search for perfection using the myth of a man with a horse's head.",
                time = "6:00 PM",
                venue = "Ranga Shankara",
                category = "Mythological"
            )
        )
    }

    fun getEventById(id: Int): Event? {
        return _events.value.find { it.id == id }
    }
}
