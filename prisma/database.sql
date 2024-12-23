
CREATE TABLE Users (
    access_token VARCHAR(255),
    refresh_token VARCHAR(255),
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    verified_email BOOLEAN NOT NULL,
    name VARCHAR(255),
    given_name VARCHAR(255),
    family_name VARCHAR(255),
    picture VARCHAR(255),
    hd VARCHAR(255),
    isSync BOOLEAN DEFAULT false
);

CREATE TABLE "group" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    numMember INT
);

CREATE TABLE User_Group (
    user_id UUID,
    group_id UUID,
  
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES "group"(id) ON DELETE CASCADE
);


CREATE TABLE Event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    startTime TIMESTAMP,
    endTime TIMESTAMP,
    isRecurring BOOLEAN,
    isComplete BOOLEAN,
    type VARCHAR(50),
    reminderTime INT,
    recurrentPattern VARCHAR(255),
    priority INT,
    group_id UUID,
    FOREIGN KEY (group_id) REFERENCES "group"(id) ON DELETE CASCADE
);

CREATE TABLE Message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID,
    createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isBot BOOLEAN,
    text TEXT,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

