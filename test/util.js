const getSession = async (transaction, votingSystem) => {
    const sessionId = await getSessionId(transaction);
    const session = await votingSystem.getSessionInfo(sessionId);
    return session;
}

const getSessionId = async (transaction) => {
    const receipt = await transaction.wait();
    const sessionId = receipt.logs[0].args[0];
    return sessionId;
}

module.exports = {
    getSession,
    getSessionId
}
