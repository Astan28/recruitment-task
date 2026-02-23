-- Create Candidate table
CREATE TABLE Candidate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    yearsOfExperience INTEGER NOT NULL,
    recruiterNotes TEXT,
    status TEXT NOT NULL CHECK(status IN ('nowy', 'w trakcie rozmów', 'zaakceptowany', 'odrzucony')) DEFAULT 'nowy',
    consentDate DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create many-to-many relationship table between Candidate and JobOffer
CREATE TABLE CandidateJobOffer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidateId INTEGER NOT NULL,
    jobOfferId INTEGER NOT NULL,
    appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidateId) REFERENCES Candidate(id) ON DELETE CASCADE,
    FOREIGN KEY (jobOfferId) REFERENCES JobOffer(id) ON DELETE CASCADE,
    UNIQUE(candidateId, jobOfferId)
);