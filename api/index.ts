import express from 'express';
import mongoose, {Schema} from 'mongoose';

const app = express();

// Middleware to parse JSON
app.use(express.json());

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
    rsvps: {type: [Schema.Types.Array]},

}, {
    timestamps: true,
    collection: "events",
});
const Event = mongoose.model("Event", EventSchema);

// Routes
app.get('/invitation/:id', async (req, res) => {
    const id = req?.params?.id;
    const items = await Event.findOne({_id: id});
    res.json(items);
});

app.post('/invitation/rsvp/:id', async (req, res) => {
    const id = req?.params?.id;
    const data = req?.body;
    const event = await Event.findOneAndUpdate(
        {_id: id},
        {$set: {...data}},
        {new: true, runValidators: true}
    )
    res.json(event);
});

app.listen(3000, () => console.log('Server running on port 3000'));

export default app;
