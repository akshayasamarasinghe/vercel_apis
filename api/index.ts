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
    start_time: {type: Schema.Types.String},
    end_time: {type: Schema.Types.String},
    image_url: {type: Schema.Types.String},
    category: {type: [Schema.Types.String]},
    rsvps: {type: [Schema.Types.Mixed]},

}, {
    timestamps: true,
    collection: "events",
});
const Event = mongoose.model("Event", EventSchema);

const UserSchema = new mongoose.Schema({
    organization_id: {type: Schema.Types.ObjectId, ref: "organizations"},
    first_name: {type: Schema.Types.String},
    last_name: {type: Schema.Types.String},
    email: {type: Schema.Types.String, unique: true},
    phone_no: {type: Schema.Types.String},
    type: {type: Schema.Types.String},
    password: {type: Schema.Types.String},

}, {
    timestamps: true,
    collection: "users",
});
const User = mongoose.model("User", UserSchema);

// Routes
app.get('/invitation/:id', async (req, res) => {
    try {
        const id = req?.params?.id;
        const items = await Event.findOne({_id: id}).lean();
        return res.json(items);
    } catch (e) {
        throw res.status(500).json(e);
    }
});

app.post('/invitation/rsvp/:id', async (req, res) => {
    try {
        const id = req?.params?.id;
        const data = req?.body;
        let existingUser: any = {};
        const selectedEvent = await Event.findOne({_id: id}).lean();
        const modifiedRsvps = selectedEvent?.rsvps?.length > 0 ? selectedEvent?.rsvps : [];
        if (data?.email && modifiedRsvps?.length > 0) {
            const isExist = modifiedRsvps?.find((rsvp: any) => rsvp?.email === data?.email);
            if (isExist) {
                return res.json({message: "User is already responded to this invitation!"})
            }
        }
        if (data?.email) {
            existingUser = await User.findOne({email: data?.email}).lean();
        }
        modifiedRsvps?.push({...data, user: existingUser?._id ? existingUser?._id : undefined});
        const event = await Event.findOneAndUpdate(
            {_id: id},
            {$set: {rsvps: modifiedRsvps}},
            {new: true, runValidators: true}
        ).lean();
        return res.json(event);
    } catch (e) {
        throw res.status(500).json(e);
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));

export default app;
