import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import swaggerDocs from "./swagger/swagger-config.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import adminVehicleRouter from "./routes/admin.vehicle.routes.js"
import vehicleRouter from "./routes/vehicle.routes.js"
import locationRouter from "./routes/Location.routes.js"


//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin/vehicles", adminVehicleRouter)
app.use("/api/v1/vehicles", vehicleRouter)
app.use("/api/v1/location", locationRouter)

// Swagger documentation
swaggerDocs(app);

export { app }