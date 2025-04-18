-- Create message_replies table for replies to profile messages
CREATE TABLE message_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  content TEXT NOT NULL,
  sender_username VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Create room_message_replies table for replies to room messages
CREATE TABLE room_message_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_message_id UUID NOT NULL,
  content TEXT NOT NULL,
  sender_username VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (room_message_id) REFERENCES room_messages(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_message_replies_message_id ON message_replies(message_id);
CREATE INDEX idx_room_message_replies_room_message_id ON room_message_replies(room_message_id);
