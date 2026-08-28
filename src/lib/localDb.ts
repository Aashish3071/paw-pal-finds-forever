// Local Database Engine for PawPal (Persistent via LocalStorage)

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

export interface LocalPet {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  breed: string;
  gender: "male" | "female";
  age: number; // in months
  description: string;
  image_urls: string[];
  location: string;
  is_adopted: boolean;
  created_at: string;
  owner?: {
    name: string;
    avatar_url?: string;
  };
}

export interface LocalConversation {
  id: string;
  pet_id: string;
  adopter_id: string;
  owner_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  pet: {
    name: string;
    image_urls: string[];
    type: string;
  };
  other_user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

export interface LocalMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  template_id?: string;
  created_at: string;
  read_at?: string | null;
  sender: {
    name: string;
    avatar_url?: string;
  };
}

const STORAGE_KEYS = {
  USER: "pawpal_current_user",
  ALL_USERS: "pawpal_users",
  PETS: "pawpal_pets",
  SAVED_PETS: "pawpal_saved_pets",
  CONVERSATIONS: "pawpal_conversations",
  MESSAGES: "pawpal_messages",
};

// Initial Seed Users
const SEED_USERS: LocalUser[] = [
  {
    id: "user-demo-current",
    name: "Alex Sharma",
    email: "alex@pawpal.com",
    location: "Mumbai, India",
    bio: "Passionate animal lover and pet foster parent. Caring for rescues!",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "user-owner-priya",
    name: "Priya Verma",
    email: "priya@gmail.com",
    location: "Bandra, Mumbai",
    bio: "Dog lover with a big yard. Rehoming well-trained pups.",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "user-owner-rahul",
    name: "Rahul Mehta",
    email: "rahul@gmail.com",
    location: "Koregaon Park, Pune",
    bio: "Fostering cats and kittens until they find forever homes.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "user-owner-sneha",
    name: "Sneha Rao",
    email: "sneha@gmail.com",
    location: "Indiranagar, Bangalore",
    bio: "Pet rescue volunteer and advocate.",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

// Initial Seed Pets
const SEED_PETS: LocalPet[] = [
  {
    id: "pet-1",
    owner_id: "user-owner-priya",
    name: "Buddy",
    type: "dog",
    breed: "Golden Retriever",
    gender: "male",
    age: 14,
    description: "Buddy is a sweet, playful 14-month-old Golden Retriever. Fully vaccinated, potty trained, and loves fetch. Gets along wonderfully with kids and other pets.",
    image_urls: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
    ],
    location: "Bandra, Mumbai",
    is_adopted: false,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    owner: {
      name: "Priya Verma",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    },
  },
  {
    id: "pet-2",
    owner_id: "user-owner-rahul",
    name: "Luna",
    type: "cat",
    breed: "Persian Cat",
    gender: "female",
    age: 8,
    description: "Luna is a calm, fluffy 8-month-old Persian kitty looking for a quiet, cozy home. Dewormed, vaccinated, and very affectionate.",
    image_urls: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80",
    ],
    location: "Koregaon Park, Pune",
    is_adopted: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    owner: {
      name: "Rahul Mehta",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    },
  },
  {
    id: "pet-3",
    owner_id: "user-owner-priya",
    name: "Max",
    type: "dog",
    breed: "Beagle",
    gender: "male",
    age: 6,
    description: "Max is an energetic 6-month-old Beagle puppy with a heart of gold. Loves outdoor walks and exploring. Vaccinations up to date.",
    image_urls: [
      "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80",
    ],
    location: "Andheri West, Mumbai",
    is_adopted: false,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    owner: {
      name: "Priya Verma",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    },
  },
  {
    id: "pet-4",
    owner_id: "user-owner-sneha",
    name: "Oreo",
    type: "rabbit",
    breed: "Holland Lop",
    gender: "female",
    age: 5,
    description: "Oreo is a friendly, gentle Holland Lop rabbit who loves fresh greens and gentle head pats. Litter box trained and very tidy.",
    image_urls: [
      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80",
    ],
    location: "Indiranagar, Bangalore",
    is_adopted: false,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    owner: {
      name: "Sneha Rao",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    },
  },
  {
    id: "pet-5",
    owner_id: "user-owner-rahul",
    name: "Kiwi",
    type: "bird",
    breed: "Budgerigar",
    gender: "male",
    age: 10,
    description: "Kiwi is a cheerful and vocal little budgie who loves whistling tunes and eating millet treats. Comes with cage and accessories.",
    image_urls: [
      "https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=800&q=80",
    ],
    location: "Viman Nagar, Pune",
    is_adopted: false,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    owner: {
      name: "Rahul Mehta",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    },
  },
  {
    id: "pet-6",
    owner_id: "user-demo-current",
    name: "Milo",
    type: "cat",
    breed: "British Shorthair",
    gender: "male",
    age: 24,
    description: "Milo is a chubby, dignified British Shorthair looking for a warm companion. Calm, quiet, and enjoys napping by the sun.",
    image_urls: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80",
    ],
    location: "Mumbai, India",
    is_adopted: false,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    owner: {
      name: "Alex Sharma",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    },
  },
];

// Initial Seed Conversations
const SEED_CONVERSATIONS: LocalConversation[] = [
  {
    id: "conv-1",
    pet_id: "pet-1",
    adopter_id: "user-demo-current",
    owner_id: "user-owner-priya",
    status: "active",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    pet: {
      name: "Buddy",
      image_urls: [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
      ],
      type: "dog",
    },
    other_user: {
      id: "user-owner-priya",
      name: "Priya Verma",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    },
    last_message: {
      content: "Hi! Is Buddy still available for adoption?",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      sender_id: "user-demo-current",
    },
    unread_count: 0,
  },
];

const SEED_MESSAGES: LocalMessage[] = [
  {
    id: "msg-1",
    conversation_id: "conv-1",
    sender_id: "user-demo-current",
    content: "Hi! Is Buddy still available for adoption?",
    message_type: "text",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    read_at: new Date().toISOString(),
    sender: {
      name: "Alex Sharma",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    },
  },
  {
    id: "msg-2",
    conversation_id: "conv-1",
    sender_id: "user-owner-priya",
    content: "Hello Alex! Yes, Buddy is still looking for a loving home. Would you like to schedule a visit this weekend?",
    message_type: "text",
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    read_at: new Date().toISOString(),
    sender: {
      name: "Priya Verma",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    },
  },
];

// Database Manager Helper
class LocalDatabase {
  private authListeners: ((user: LocalUser | null) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.PETS)) {
      localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(SEED_PETS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALL_USERS)) {
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      // Default to logged-in demo user
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(SEED_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SAVED_PETS)) {
      localStorage.setItem(STORAGE_KEYS.SAVED_PETS, JSON.stringify(["pet-2"]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(SEED_CONVERSATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(SEED_MESSAGES));
    }
  }

  // --- Auth Operations ---
  public getCurrentUser(): LocalUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  }

  public getSession(): { user: LocalUser } | null {
    const user = this.getCurrentUser();
    return user ? { user } : null;
  }

  public signIn(email: string, _password?: string): { user: LocalUser; error: null } {
    const users: LocalUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || "[]");
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Auto-create user for frictionless login
      user = {
        id: `user-${Date.now()}`,
        name: email.split("@")[0] || "Pet Lover",
        email,
        location: "Mumbai, India",
        created_at: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    }

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.notifyAuth(user);
    return { user, error: null };
  }

  public signUp(email: string, name?: string): { user: LocalUser; error: null } {
    const users: LocalUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || "[]");
    const newUser: LocalUser = {
      id: `user-${Date.now()}`,
      name: name || email.split("@")[0] || "Pet Lover",
      email,
      location: "Mumbai, India",
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    this.notifyAuth(newUser);
    return { user: newUser, error: null };
  }

  public signOut(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.notifyAuth(null);
  }

  public onAuthStateChange(callback: (user: LocalUser | null) => void) {
    this.authListeners.push(callback);
    return {
      unsubscribe: () => {
        this.authListeners = this.authListeners.filter((l) => l !== callback);
      },
    };
  }

  private notifyAuth(user: LocalUser | null) {
    this.authListeners.forEach((listener) => listener(user));
  }

  // --- Profile Operations ---
  public getProfile(): LocalUser | null {
    return this.getCurrentUser();
  }

  public updateProfile(updates: Partial<LocalUser>): LocalUser {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Not logged in");

    const updatedUser = { ...user, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

    // Update in all users
    const users: LocalUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || "[]");
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    }

    this.notifyAuth(updatedUser);
    return updatedUser;
  }

  // --- Pet Operations ---
  public getPets(): LocalPet[] {
    const pets: LocalPet[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PETS) || "[]");
    return pets.filter((p) => !p.is_adopted);
  }

  public getMyPets(): LocalPet[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    const pets: LocalPet[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PETS) || "[]");
    return pets.filter((p) => p.owner_id === user.id);
  }

  public createPet(data: Omit<LocalPet, "id" | "owner_id" | "created_at" | "is_adopted">): LocalPet {
    const user = this.getCurrentUser();
    if (!user) throw new Error("User must be logged in to create a pet listing");

    const pets: LocalPet[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PETS) || "[]");
    const newPet: LocalPet = {
      ...data,
      id: `pet-${Date.now()}`,
      owner_id: user.id,
      is_adopted: false,
      created_at: new Date().toISOString(),
      owner: {
        name: user.name,
        avatar_url: user.avatar_url,
      },
    };

    pets.unshift(newPet);
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
    return newPet;
  }

  public markPetAsAdopted(petId: string): void {
    const pets: LocalPet[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PETS) || "[]");
    const idx = pets.findIndex((p) => p.id === petId);
    if (idx !== -1) {
      pets[idx].is_adopted = true;
      localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
    }
  }

  public deletePet(petId: string): void {
    let pets: LocalPet[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PETS) || "[]");
    pets = pets.filter((p) => p.id !== petId);
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
  }

  // --- Wishlist / Saved Pets ---
  public getSavedPets(): string[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_PETS) || "[]");
  }

  public toggleSavedPet(petId: string): boolean {
    const saved: string[] = this.getSavedPets();
    let isSaved = false;
    let updated: string[];

    if (saved.includes(petId)) {
      updated = saved.filter((id) => id !== petId);
      isSaved = false;
    } else {
      updated = [...saved, petId];
      isSaved = true;
    }

    localStorage.setItem(STORAGE_KEYS.SAVED_PETS, JSON.stringify(updated));
    return isSaved;
  }

  // --- Conversations & Messaging ---
  public getConversations(): LocalConversation[] {
    const user = this.getCurrentUser();
    if (!user) return [];

    const conversations: LocalConversation[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || "[]"
    );

    return conversations
      .filter((c) => c.adopter_id === user.id || c.owner_id === user.id)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  public createConversation(petId: string, ownerId: string, initialMessage?: string): LocalConversation {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Must be logged in to start a conversation");

    const conversations: LocalConversation[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || "[]"
    );

    // Check existing
    const existing = conversations.find(
      (c) => c.pet_id === petId && c.adopter_id === user.id
    );
    if (existing) {
      return existing;
    }

    // Get Pet & Owner details
    const pets: LocalPet[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PETS) || "[]");
    const pet = pets.find((p) => p.id === petId);
    const users: LocalUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || "[]");
    const owner = users.find((u) => u.id === ownerId) || {
      id: ownerId,
      name: "Pet Parent",
      avatar_url: undefined,
    };

    const newConvId = `conv-${Date.now()}`;
    const now = new Date().toISOString();

    const newConv: LocalConversation = {
      id: newConvId,
      pet_id: petId,
      adopter_id: user.id,
      owner_id: ownerId,
      status: "active",
      created_at: now,
      updated_at: now,
      pet: {
        name: pet?.name || "Pet",
        image_urls: pet?.image_urls || [],
        type: pet?.type || "pet",
      },
      other_user: {
        id: owner.id,
        name: owner.name,
        avatar_url: owner.avatar_url,
      },
      last_message: initialMessage
        ? {
            content: initialMessage,
            created_at: now,
            sender_id: user.id,
          }
        : undefined,
      unread_count: 0,
    };

    conversations.unshift(newConv);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));

    if (initialMessage) {
      this.sendMessage(newConvId, initialMessage);
    }

    return newConv;
  }

  public getMessages(conversationId: string): LocalMessage[] {
    const messages: LocalMessage[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.MESSAGES) || "[]"
    );
    return messages
      .filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  public sendMessage(
    conversationId: string,
    content: string,
    messageType: string = "text",
    templateId?: string
  ): LocalMessage {
    const user = this.getCurrentUser();
    if (!user) throw new Error("Must be logged in to send a message");

    const messages: LocalMessage[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.MESSAGES) || "[]"
    );
    const now = new Date().toISOString();

    const newMessage: LocalMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      message_type: messageType,
      template_id: templateId,
      created_at: now,
      read_at: null,
      sender: {
        name: user.name,
        avatar_url: user.avatar_url,
      },
    };

    messages.push(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

    // Update conversation last message & updated_at
    const conversations: LocalConversation[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || "[]"
    );
    const convIdx = conversations.findIndex((c) => c.id === conversationId);
    if (convIdx !== -1) {
      conversations[convIdx].last_message = {
        content,
        created_at: now,
        sender_id: user.id,
      };
      conversations[convIdx].updated_at = now;
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    }

    return newMessage;
  }

  public markMessagesAsRead(messageIds: string[]): void {
    const messages: LocalMessage[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.MESSAGES) || "[]"
    );
    let changed = false;

    messages.forEach((msg) => {
      if (messageIds.includes(msg.id) && !msg.read_at) {
        msg.read_at = new Date().toISOString();
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }
  }

  // --- Local File Upload Helper (Base64) ---
  public async uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert image to data URL"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

export const localDb = new LocalDatabase();
