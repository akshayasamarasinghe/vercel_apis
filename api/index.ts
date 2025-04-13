import cors from 'cors';
import express from 'express';
import mongoose, {Schema} from 'mongoose';

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

const mongo_uri = "mongodb+srv://akshayadevt:PXfTdar8qu9Hjaan@cluster-i.ne1fe.mongodb.net/event-planner-web-app?retryWrites=true&w=majority"

// Connect to MongoDB
mongoose.connect(mongo_uri, {})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Define a schema and model
const EventSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: "users"},
    title: {type: Schema.Types.String},
    description: {type: Schema.Types.String},
    start_date: {type: Schema.Types.Date},
    end_date: {type: Schema.Types.Date},
    // start_time: {type: Schema.Types.Date},
    // end_time: {type: Schema.Types.Date},
    image_url: {type: Schema.Types.String},
    category: {type: [Schema.Types.String]},
    rsvps: {type: [Schema.Types.Mixed]},

}, {
    timestamps: true,
    collection: "events",
});
const Event = mongoose.model("Event", EventSchema);

// Routes
app.get('/invitation/:id', async (req, res) => {
    try {
        const id = req?.params?.id;
        const items = await Event.findOne({_id: id}).lean();
        res.json(items);
    } catch (e) {
        res.status(500).json(e);
    }
});

app.post('/invitation/rsvp/:id', async (req, res) => {
    try {
        const id = req?.params?.id;
        const data = req?.body;
        const selectedEvent = await Event.findOne({_id: id}).lean();
        console.log(selectedEvent, "selectedEvent");
        const modifiedRsvps = selectedEvent?.rsvps?.length > 0 ? selectedEvent?.rsvps : [];
        console.log(modifiedRsvps, "modifiedRsvps 1");
        modifiedRsvps?.push(data);
        console.log(data, "data");
        console.log(modifiedRsvps, "modifiedRsvps 2");
        const event = await Event.findOneAndUpdate(
            {_id: id},
            {$set: {rsvps: modifiedRsvps}},
            {new: true, runValidators: true}
        ).lean();
        res.json(event);
    } catch (e) {
        res.status(500).json(e);
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));

export default app;
