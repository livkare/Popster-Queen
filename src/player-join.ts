import { PeerPlayerManager } from './peer-player';
import { randomUUID } from './utils';
import { polyfill } from 'mobile-drag-drop';
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';

// Initialize mobile drag and drop polyfill for iOS/Android support
polyfill({
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

const playerJoinPage = document.getElementById('player-join-page');
const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
const joinButton = document.getElementById('player-join-button') as HTMLButtonElement;
const playerStatusText = document.getElementById('player-status-text');
const playerGamePage = document.getElementById('player-game-page');
const playerTimeline = document.getElementById('player-timeline');

let peerPlayer: PeerPlayerManager | null = null;
let gameId: string | null = null; // This is the host peer ID
let playerId: string | null = null;
let playerName: string | null = null;
let timelineCards: Array<{ id: string; track_id: string; track_name: string; artist: string; year: number | null; is_mystery: boolean; mystery_track_id: string | null; position: number; is_revealed: boolean; is_correct: boolean | null; album_image_url: string | null }> = [];
let draggedCard: HTMLElement | null = null;
let isRevealed: boolean = false;
let dropIndicator: HTMLElement | null = null;
let containerHandlersAttached: boolean = false;

// Get game ID (host peer ID) from URL hash
function getGameIdFromURL(): string | null {
  // Check hash first (for GitHub Pages compatibility)
  const hash = window.location.hash;
  const hashMatch = hash.match(/#\/join\/([^/]+)/);
  if (hashMatch) return hashMatch[1];

  // Fallback to pathname
  const path = window.location.pathname;
  const match = path.match(/\/join\/([^/]+)/);
  if (match) return match[1];

  // Fallback to query params
  const params = new URLSearchParams(window.location.search);
  return params.get('gameId');
}

// Initialize player join page
export function initializePlayerJoin(): void {
  // Show player join page
  const homepage = document.getElementById('homepage');
  const timemusicPage = document.getElementById('timemusic-page');
  if (playerJoinPage) {
    playerJoinPage.style.display = 'flex';
  }
  if (homepage) {
    homepage.style.display = 'none';
  }
  if (timemusicPage) {
    timemusicPage.style.display = 'none';
  }

  gameId = getGameIdFromURL();

  if (!gameId) {
    if (playerStatusText) {
      playerStatusText.textContent = 'Invalid game link';
    }
    return;
  }

  // Check if we have stored player info (reconnection)
  const storedPlayerId = localStorage.getItem('playerId');
  const storedGameId = localStorage.getItem('playerGameId');
  const storedPlayerName = localStorage.getItem('playerName');

  if (storedPlayerId && storedGameId === gameId && storedPlayerName) {
    playerId = storedPlayerId;
    playerName = storedPlayerName;
    if (nameInput) {
      nameInput.value = storedPlayerName;
      nameInput.disabled = true;
    }
    connectAsPlayer();
  }

  if (joinButton) {
    joinButton.addEventListener('click', handleJoin);
  }

  if (nameInput) {
    nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleJoin();
      }
    });
  }
}

function handleJoin(): void {
  if (!nameInput || !gameId) return;

  const name = nameInput.value.trim();
  if (!name) {
    alert('Please enter your name');
    return;
  }

  playerName = name;
  if (!playerId) {
    playerId = randomUUID();
  }

  // Store player info
  localStorage.setItem('playerId', playerId);
  localStorage.setItem('playerGameId', gameId);
  localStorage.setItem('playerName', playerName);

  connectAsPlayer();
}

async function connectAsPlayer(): Promise<void> {
  if (!gameId || !playerId || !playerName) return;

  try {
    peerPlayer = new PeerPlayerManager();

    // Set up message handlers before connecting
    peerPlayer.on('PLAYER_CONNECTED', (message) => {
      console.log('Player connected:', message);
      if (playerStatusText) {
        playerStatusText.textContent = `Connected to game!`;
      }
      if (nameInput) {
        nameInput.disabled = true;
      }
      if (joinButton) {
        joinButton.textContent = 'Connected';
        joinButton.disabled = true;
      }

      // Request state to restore timeline if game already started
      setTimeout(() => {
        if (peerPlayer && gameId && playerId) {
          peerPlayer.send({
            type: 'REQUEST_STATE',
            gameId,
            playerId
          });
        }
      }, 500);
    });

    peerPlayer.on('GAME_STARTED', () => {
      if (playerJoinPage && playerGamePage) {
        playerJoinPage.style.display = 'none';
        playerGamePage.style.display = 'flex';
      }
    });

    peerPlayer.on('PLAYER_CARD_DEALT', (message) => {
      const card = {
        id: message.card.id || `card-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        track_id: message.card.track_id,
        track_name: message.card.track_name,
        artist: message.card.artist,
        year: message.card.year,
        is_mystery: false,
        mystery_track_id: null,
        position: timelineCards.length,
        is_revealed: false,
        is_correct: null,
        album_image_url: null
      };
      timelineCards.push(card);
      renderTimeline();
    });

    peerPlayer.on('MYSTERY_SONG_PLAYING', (message) => {
      // Add mystery placeholder to timeline
      isRevealed = false;
      const mysteryCard = {
        id: message.cardId || `mystery-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        track_id: '',
        track_name: '?',
        artist: '?',
        year: null,
        is_mystery: true,
        mystery_track_id: message.mysteryTrackId,
        position: timelineCards.length,
        is_revealed: false,
        is_correct: null,
        album_image_url: null
      };
      timelineCards.push(mysteryCard);
      renderTimeline();
    });

    peerPlayer.on('MYSTERY_CARD_REVEALED', (message) => {
      isRevealed = true;
      const card = timelineCards.find(c => c.id === message.cardId);
      if (card) {
        card.is_revealed = true;
        card.is_correct = message.isCorrect;
        card.track_name = message.trackName;
        card.artist = message.artist;
        card.year = message.year;
        card.album_image_url = message.albumImageUrl;
      }
      renderTimeline();
    });

    peerPlayer.on('MYSTERY_CARD_REMOVED', (message) => {
      timelineCards = timelineCards.filter(c => c.id !== message.cardId);
      isRevealed = false;
      renderTimeline();
    });

    peerPlayer.on('MYSTERY_CARD_CONVERTED', (message) => {
      // Convert mystery card to regular card
      const card = timelineCards.find(c => c.id === message.cardId);
      if (card) {
        card.is_mystery = false;
        card.track_id = message.track_id;
        card.track_name = message.track_name;
        card.artist = message.artist;
        card.year = message.year;
        card.album_image_url = message.album_image_url;
        card.mystery_track_id = null;
      }
      isRevealed = false;
      renderTimeline();
    });

    peerPlayer.on('STATE_SYNC', (message) => {
      if (message.gameStarted && message.timeline) {
        timelineCards = message.timeline.map((card: any) => ({
          id: card.id,
          track_id: card.track_id || '',
          track_name: card.track_name,
          artist: card.artist,
          year: card.year,
          is_mystery: Boolean(card.is_mystery),
          mystery_track_id: card.mystery_track_id,
          position: card.position,
          is_revealed: Boolean(card.is_revealed),
          is_correct: card.is_correct === null ? null : Boolean(card.is_correct),
          album_image_url: card.album_image_url || null
        }));
        isRevealed = timelineCards.some(c => c.is_revealed);
        renderTimeline();

        if (playerJoinPage && playerGamePage) {
          playerJoinPage.style.display = 'none';
          playerGamePage.style.display = 'flex';
        }
      }
    });

    peerPlayer.on('TIMELINE_UPDATED', () => {
      // Timeline was successfully updated
      console.log('Timeline updated');
    });

    peerPlayer.on('ERROR', (message) => {
      console.error('Peer error:', message.message);
      if (playerStatusText) {
        playerStatusText.textContent = `Error: ${message.message}`;
      }
    });

    peerPlayer.on('connection_closed', () => {
      if (playerStatusText) {
        playerStatusText.textContent = 'Connection lost';
      }
    });

    // Connect to host peer (gameId is the host's peer ID)
    await peerPlayer.connect(gameId, playerId);

    // Send join message
    peerPlayer.send({
      type: 'PLAYER_JOIN',
      gameId,
      playerId,
      name: playerName
    });

  } catch (error) {
    console.error('Failed to connect:', error);
    if (playerStatusText) {
      playerStatusText.textContent = 'Failed to connect to game';
    }
  }
}

// Render timeline
function renderTimeline(): void {
  if (!playerTimeline) return;

  // Sort cards by position
  timelineCards.sort((a, b) => a.position - b.position);

  // Build timeline - show all cards in chronological order with drop zones
  let html = '';

  // Add drop zone before the first card
  if (!isRevealed) {
    html += renderDropZone(-1);
  }

  timelineCards.forEach((card, index) => {
    if (card.is_mystery) {
      html += renderMysteryCard(card, index);
    } else {
      html += renderRegularCard(card, index);
    }
    
    // Add drop zone after each card
    if (!isRevealed) {
      html += renderDropZone(index);
    }
  });

  playerTimeline.innerHTML = html;

  // Only attach drag handlers to mystery card
  const mysteryCardElement = playerTimeline.querySelector('.mystery-placeholder') as HTMLElement;
  if (mysteryCardElement && !isRevealed) {
    mysteryCardElement.addEventListener('dragstart', handleDragStart);
    mysteryCardElement.addEventListener('dragend', handleDragEnd);
  }

  // Attach drop handlers to drop zones
  const dropZoneElements = playerTimeline.querySelectorAll('.timeline-drop-zone');
  dropZoneElements.forEach((zone) => {
    const zoneElement = zone as HTMLElement;
    zoneElement.addEventListener('dragover', handleDropZoneDragOver);
    zoneElement.addEventListener('drop', handleDropZoneDrop);
    zoneElement.addEventListener('dragenter', handleDropZoneDragEnter);
    zoneElement.addEventListener('dragleave', handleDropZoneDragLeave);
  });

  // Attach drop handlers to regular cards (as drop targets) - keep for backward compatibility
  const regularCardElements = playerTimeline.querySelectorAll('.timeline-card:not(.mystery-placeholder)');
  regularCardElements.forEach((card) => {
    const cardElement = card as HTMLElement;
    cardElement.addEventListener('dragover', handleDragOver);
    cardElement.addEventListener('drop', handleDrop);
  });

  // Add container-level dragover handler (only once)
  if (playerTimeline && !isRevealed && !containerHandlersAttached) {
    playerTimeline.addEventListener('dragover', handleContainerDragOver);
    playerTimeline.addEventListener('drop', handleDrop);
    containerHandlersAttached = true;
  }
}

// Drag and drop event handlers (defined outside renderTimeline to avoid recreating)
function handleDragStart(e: Event): void {
  const dragEvent = e as DragEvent;
  const cardElement = dragEvent.target as HTMLElement;
  draggedCard = cardElement;
  draggedCard.classList.add('dragging');
  if (dragEvent.dataTransfer) {
    dragEvent.dataTransfer.effectAllowed = 'move';
  }

  // Create and show drop indicator
  if (!dropIndicator && playerTimeline) {
    dropIndicator = document.createElement('div');
    dropIndicator.className = 'drop-indicator';
  }

  // Show all drop zones when dragging starts
  if (playerTimeline) {
    const dropZones = playerTimeline.querySelectorAll('.timeline-drop-zone');
    dropZones.forEach((zone) => {
      (zone as HTMLElement).classList.add('drop-zone-visible');
    });
  }
}

function handleDragEnd(): void {
  if (draggedCard) {
    draggedCard.classList.remove('dragging');
  }
  draggedCard = null;

  // Remove drop indicator from DOM
  if (dropIndicator && dropIndicator.parentNode) {
    dropIndicator.parentNode.removeChild(dropIndicator);
  }

  // Hide all drop zones when dragging ends
  if (playerTimeline) {
    const dropZones = playerTimeline.querySelectorAll('.timeline-drop-zone');
    dropZones.forEach((zone) => {
      const zoneElement = zone as HTMLElement;
      zoneElement.classList.remove('drop-zone-visible');
      zoneElement.classList.remove('drop-zone-active');
    });
  }
}

function handleDragOver(e: Event): void {
  const dragEvent = e as DragEvent;
  const cardElement = dragEvent.currentTarget as HTMLElement;
  dragEvent.preventDefault();
  if (dragEvent.dataTransfer) {
    dragEvent.dataTransfer.dropEffect = 'move';
  }

  if (!draggedCard || !playerTimeline || draggedCard === cardElement) return;

  const afterElement = getDragAfterElement(playerTimeline, dragEvent.clientY);

  // Position drop indicator at insertion point
  if (dropIndicator) {
    if (afterElement == null) {
      playerTimeline.appendChild(dropIndicator);
    } else {
      playerTimeline.insertBefore(dropIndicator, afterElement);
    }
  }

  // Position the dragged card (keep existing behavior for smooth dragging)
  if (afterElement == null) {
    playerTimeline.appendChild(draggedCard);
  } else {
    playerTimeline.insertBefore(draggedCard, afterElement);
  }
}

function handleDrop(e: Event): void {
  e.preventDefault();
  updateTimelinePositions();
}

// Handle dragover on timeline container
function handleContainerDragOver(e: Event): void {
  const dragEvent = e as DragEvent;
  dragEvent.preventDefault();
  if (dragEvent.dataTransfer) {
    dragEvent.dataTransfer.dropEffect = 'move';
  }
}

// Handle dragover on drop zone
function handleDropZoneDragOver(e: Event): void {
  const dragEvent = e as DragEvent;
  dragEvent.preventDefault();
  if (dragEvent.dataTransfer) {
    dragEvent.dataTransfer.dropEffect = 'move';
  }
}

// Handle dragenter on drop zone
function handleDropZoneDragEnter(e: Event): void {
  const dragEvent = e as DragEvent;
  const zoneElement = dragEvent.currentTarget as HTMLElement;
  if (draggedCard) {
    zoneElement.classList.add('drop-zone-active');
  }
}

// Handle dragleave on drop zone
function handleDropZoneDragLeave(e: Event): void {
  const dragEvent = e as DragEvent;
  const zoneElement = dragEvent.currentTarget as HTMLElement;
  zoneElement.classList.remove('drop-zone-active');
}

// Handle drop on drop zone
function handleDropZoneDrop(e: Event): void {
  e.preventDefault();
  e.stopPropagation(); // Prevent event from bubbling to container handler
  const dragEvent = e as DragEvent;
  const zoneElement = dragEvent.currentTarget as HTMLElement;
  zoneElement.classList.remove('drop-zone-active');
  
  if (!draggedCard || !playerTimeline) return;
  
  // Find the next sibling that is a card (not a drop zone, and not the dragged card itself)
  let nextSibling = zoneElement.nextElementSibling;
  while (nextSibling) {
    if (nextSibling.classList.contains('timeline-drop-zone')) {
      nextSibling = nextSibling.nextElementSibling;
    } else if (nextSibling === draggedCard) {
      // Skip the dragged card itself, find the next one
      nextSibling = nextSibling.nextElementSibling;
    } else if (nextSibling.classList.contains('timeline-card')) {
      // Found a card that's not the dragged card
      break;
    } else {
      // Not a card or drop zone, skip
      nextSibling = nextSibling.nextElementSibling;
    }
  }
  
  // Insert the dragged card after the drop zone, before the next card
  // If draggedCard is already in the DOM, insertBefore will move it
  if (nextSibling && nextSibling !== draggedCard) {
    playerTimeline.insertBefore(draggedCard, nextSibling);
  } else if (!nextSibling) {
    // No next sibling, append to end (only if not already at end)
    if (draggedCard.parentNode === playerTimeline && draggedCard.nextElementSibling) {
      // Card is already in DOM but not at end, move it
      playerTimeline.appendChild(draggedCard);
    } else if (draggedCard.parentNode !== playerTimeline) {
      // Card is not in DOM (shouldn't happen, but handle it)
      playerTimeline.appendChild(draggedCard);
    }
  }
  // If nextSibling === draggedCard, we're trying to insert before itself, which is a no-op
  
  // Update positions
  updateTimelinePositions();
}

// Render a regular card
function renderRegularCard(card: typeof timelineCards[0], index: number): string {
  return `
    <div class="timeline-card"
         draggable="false"
         data-card-id="${card.id}"
         data-position="${index}">
      <div class="card-content">
        <div class="card-title">${card.track_name}</div>
        <div class="card-artist">${card.artist}</div>
        ${card.year ? `<div class="card-year">${card.year}</div>` : ''}
      </div>
    </div>
  `;
}

// Render mystery card
function renderMysteryCard(card: typeof timelineCards[0], index?: number): string {
  const isRevealedCard = card.is_revealed;
  const isCorrect = card.is_correct;

  let cardClasses = 'timeline-card mystery-placeholder';
  if (isRevealedCard) {
    cardClasses += isCorrect ? ' revealed-correct' : ' revealed-incorrect';
  }

  return `
    <div class="${cardClasses}"
         draggable="${!isRevealedCard && !isRevealed}"
         data-card-id="${card.id}"
         ${index !== undefined ? `data-position="${index}"` : ''}>
      <div class="card-content">
        ${!isRevealedCard ? `
          <div class="mystery-question-mark">?</div>
          <div class="card-info">Mystery Song</div>
        ` : `
          ${card.album_image_url && isCorrect ? `
            <img src="${card.album_image_url}" alt="Album cover" class="card-image" />
          ` : ''}
          <div class="card-title">${card.track_name}</div>
          <div class="card-artist">${card.artist}</div>
          ${card.year ? `<div class="card-year">${card.year}</div>` : ''}
        `}
      </div>
    </div>
  `;
}

// Render drop zone
function renderDropZone(afterIndex: number): string {
  return `
    <div class="timeline-drop-zone" data-drop-index="${afterIndex}"></div>
  `;
}

// Get element after which to insert dragged card (for vertical layout)
function getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
  const draggableElements = Array.from(container.querySelectorAll('.timeline-card:not(.dragging)')) as HTMLElement[];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null }).element;
}

// Update timeline positions after drag
function updateTimelinePositions(): void {
  if (!playerTimeline || !peerPlayer || !gameId || !playerId) return;

  // Don't allow updates if revealed
  if (isRevealed) return;

  // Get all cards (regular and mystery) in DOM order, excluding cards inside slots
  // querySelectorAll returns elements in DOM order, which reflects the current visual order
  const cards = Array.from(playerTimeline.querySelectorAll('.timeline-card'))
    .filter(card => {
      // Exclude cards that are inside slots
      return !card.closest('.timeline-slot');
    });

  const updates: Array<{ id: string; position: number }> = [];
  let positionIndex = 0;

  // Update positions based on DOM order (which includes the dragged card in its new position)
  cards.forEach((card) => {
    const cardId = card.getAttribute('data-card-id');
    if (cardId) {
      const cardData = timelineCards.find(c => c.id === cardId);
      // Update all cards (regular and mystery) that aren't revealed
      // The dragged card may still have the 'dragging' class, but we still want to update its position
      if (cardData && !cardData.is_revealed) {
        cardData.position = positionIndex;
        updates.push({ id: cardId, position: positionIndex });
        positionIndex++;
      }
    }
  });

  // Send update to host
  if (updates.length > 0) {
    peerPlayer.send({
      type: 'UPDATE_TIMELINE',
      playerId,
      timelineUpdates: updates
    });
  }
}

// Check if we're on the player join page
export function isPlayerJoinPage(): boolean {
  // Check hash (for GitHub Pages)
  if (window.location.hash.includes('/join')) return true;
  // Check pathname
  if (window.location.pathname.includes('/join')) return true;
  // Check query params
  if (window.location.search.includes('gameId=')) return true;
  return false;
}

