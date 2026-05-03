const Thread = require('../models/Message');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { filterMessage } = require('../utils/messageFilter');
const { sendEmail } = require('../utils/email');

// @POST /api/messages/start — buyer starts thread
exports.startThread = async (req, res) => {
  try {
    const { listingId, buyerCompanyName, buyerUseCase, buyerBudgetRange, buyerCompanySize, content, disclaimerAccepted } = req.body;
    if (!disclaimerAccepted) return res.status(400).json({ error: 'You must accept the disclaimer before messaging a seller.' });

    const listing = await Listing.findById(listingId).populate('seller');
    if (!listing || listing.status !== 'active') return res.status(404).json({ error: 'Listing not found or inactive' });
    if (listing.seller._id.equals(req.user._id)) return res.status(400).json({ error: 'You cannot message your own listing' });

    const filter = filterMessage(content, 0);
    if (filter.blocked) return res.status(400).json({ error: filter.reason });

    let thread = await Thread.findOne({ listing: listingId, buyer: req.user._id });
    if (thread) return res.status(400).json({ error: 'You already have an active conversation for this listing', threadId: thread._id });

    thread = await Thread.create({
      listing: listingId, buyer: req.user._id, seller: listing.seller._id,
      buyerCompanyName, buyerUseCase, buyerBudgetRange, buyerCompanySize,
      disclaimerAccepted: true, disclaimerAcceptedAt: new Date(),
      lastMessage: new Date(),
      messages: [{ listing: listingId, sender: req.user._id, receiver: listing.seller._id, content, messageIndex: 0 }]
    });

    listing.inquiryCount += 1;
    await listing.save();

    await sendEmail({ to: listing.seller.email, subject: `New inquiry for ${listing.productName}`, html: `<p>You have a new inquiry from ${buyerCompanyName || req.user.name}. Login to reply.</p>` });

    res.status(201).json({ thread });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// @POST /api/messages/:threadId/reply
exports.sendMessage = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const isBuyer = thread.buyer.equals(req.user._id);
    const isSeller = thread.seller.equals(req.user._id);
    if (!isBuyer && !isSeller) return res.status(403).json({ error: 'Access denied' });

    const msgIndex = thread.messages.length;
    const filter = filterMessage(req.body.content, msgIndex);
    if (filter.blocked) return res.status(400).json({ error: filter.reason });

    const receiver = isBuyer ? thread.seller : thread.buyer;
    const msg = { listing: thread.listing, sender: req.user._id, receiver, content: req.body.content, messageIndex: msgIndex };
    thread.messages.push(msg);
    thread.lastMessage = new Date();
    await thread.save();

    res.json({ message: thread.messages[thread.messages.length - 1] });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// @GET /api/messages/threads — list user's threads
exports.getThreads = async (req, res) => {
  try {
    const query = req.user.role === 'seller' ? { seller: req.user._id } : { buyer: req.user._id };
    const threads = await Thread.find(query)
      .populate('listing', 'productName logo slug')
      .populate('buyer', 'name email')
      .populate('seller', 'company.legalName email')
      .sort({ lastMessage: -1 });
    res.json({ threads });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// @GET /api/messages/:threadId
exports.getThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.threadId)
      .populate('listing', 'productName logo slug seller')
      .populate('buyer', 'name email')
      .populate('seller', 'company.legalName email');
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    const isParticipant = thread.buyer._id.equals(req.user._id) || thread.seller._id.equals(req.user._id);
    if (!isParticipant) return res.status(403).json({ error: 'Access denied' });
    // Mark as read
    thread.messages.forEach(m => { if (m.receiver.equals(req.user._id)) m.isRead = true; });
    await thread.save();
    res.json({ thread });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// @POST /api/messages/:threadId/report
exports.reportThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    const lastMsg = thread.messages[thread.messages.length - 1];
    if (lastMsg) { lastMsg.isReported = true; lastMsg.reportReason = req.body.reason; }
    await thread.save();
    res.json({ message: 'Reported. Our team will review within 48 hours.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
