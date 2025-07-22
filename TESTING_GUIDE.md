# 🧪 **PawPal Testing Guide**

## 🚀 **Quick Setup to Test the Messaging System**

### **Step 1: Apply Database Migration**

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the content from `supabase/migrations/20250723000000-messaging-system.sql`
3. Click **Run** to create the messaging tables

### **Step 2: Add Sample Data**

1. In Supabase **SQL Editor**, first get your user ID:
   ```sql
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```
2. Copy your user ID from the results
3. Open `sample-data.sql` in the project root
4. Replace all instances of `'00000000-0000-0000-0000-000000000000'` with your actual user ID
5. Run the modified SQL in Supabase SQL Editor

### **Step 3: Test Pet Listing Creation**

1. Open **http://localhost:8080**
2. Sign up/login to your account
3. Navigate to **Home tab**
4. Click the **"+" button** to create a pet listing
5. Fill out the form:
   - Name: "Fluffy"
   - Breed: "Golden Retriever"
   - Age: "2 years"
   - Gender: "Female"
   - Add a photo (optional)
   - Fill other required fields
6. Click **"Create Listing"**
7. You should see the new pet in the feed!

---

## 🔄 **Complete User Flow Testing**

### **For Adopters (Testing the Full Flow):**

#### **Step 1: Browse Pets**

- ✅ Go to **Home tab**
- ✅ See sample pets (Buddy, Luna, Max, etc.)
- ✅ Verify pet cards display correctly

#### **Step 2: View Pet Details**

- ✅ Click on any pet card
- ✅ Full-screen pet details modal opens
- ✅ Verify all pet information displays:
  - Pet images with navigation dots
  - Name, breed, age, gender badges
  - Location and posted date
  - Owner information with avatar
  - Pet description
  - "Start Chat" button

#### **Step 3: Start a Conversation**

- ✅ Click **"Start Chat"** button
- ✅ Should automatically navigate to **Messages tab**
- ✅ New conversation appears in the list
- ✅ Conversation shows pet image and owner name

#### **Step 4: Use Message Templates**

- ✅ Click on the conversation to open chat
- ✅ Click **"Templates"** button at the bottom
- ✅ See adopter template options:
  - "Still Available?"
  - "Health & Vaccines?"
  - "Meet & Greet"
  - "General Interest"
  - "Experience"
- ✅ Click any template
- ✅ Message sends automatically with pet name filled in

#### **Step 5: Send Custom Messages**

- ✅ Type a custom message in the input field
- ✅ Press Enter or click Send button
- ✅ Message appears in chat with proper styling
- ✅ Timestamp displays correctly

### **For Pet Owners (Need Multiple Accounts):**

#### **Step 1: Receive Notifications**

- ✅ Messages tab shows notification badge with unread count
- ✅ Red badge appears on navigation

#### **Step 2: View Conversations**

- ✅ Open Messages tab
- ✅ See conversations with pet context
- ✅ Pet image shows with adopter info overlay

#### **Step 3: Use Owner Templates**

- ✅ Open a conversation
- ✅ Click "Templates"
- ✅ See owner-specific templates:
  - "Yes, Available"
  - "Health Info"
  - "Meet-up"
  - "More Info"
  - "Appreciation"

#### **Step 4: Mark Pet as Adopted**

- ✅ In chat, click the menu (⋮) in header
- ✅ Select "Mark as Adopted"
- ✅ Pet disappears from adoption feed
- ✅ Conversation remains active

---

## 🧪 **Advanced Testing**

### **Test Real-Time Features:**

1. Open the app in two different browsers/incognito tabs
2. Sign in as different users
3. Start a conversation
4. Send messages back and forth
5. Verify real-time updates

### **Test Notification System:**

1. Send a message from one account
2. Check if notification badge appears for recipient
3. Open conversation
4. Verify unread count decreases

### **Test Wishlist Feature:**

1. Click heart icon on pet cards
2. Heart should turn red when saved
3. Check if pet is remembered as saved

### **Test Search and Filtering:**

1. Use search bar in Messages
2. Search by pet name or user name
3. Verify filtering works

---

## 🐛 **Troubleshooting**

### **If Pet Listing Form Doesn't Work:**

- Check browser console for errors
- Verify you're logged in
- Make sure Supabase connection is working

### **If Messages Don't Appear:**

- Check if the messaging migration was applied
- Verify user IDs in sample data match your auth.users
- Check browser network tab for API errors

### **If Images Don't Load:**

- Sample data uses Unsplash images (internet required)
- For uploaded images, Supabase Storage setup needed

### **If Notifications Don't Work:**

- Check if notification triggers were created in migration
- Verify user IDs match between conversations and users

---

## 📱 **Mobile Testing**

1. Open **http://localhost:8080** on mobile browser
2. Test responsive design
3. Verify touch interactions work
4. Check if navigation is mobile-friendly

---

## ✅ **Success Criteria**

You should be able to:

- ✅ Create pet listings
- ✅ View detailed pet information
- ✅ Start conversations with pet owners
- ✅ Send messages using templates
- ✅ Receive real-time notifications
- ✅ Mark pets as adopted
- ✅ Navigate seamlessly between tabs

## 🔧 **Quick Fixes**

If something doesn't work:

1. **Refresh the page**
2. **Check browser console** for errors
3. **Verify database migration** was applied
4. **Check Supabase dashboard** for data
5. **Restart the dev server**: `npm run dev`

---

**🎉 Your PawPal app is now fully functional with the complete messaging and adoption workflow!**
