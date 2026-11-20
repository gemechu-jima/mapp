

export type AuthResponse={
    token:string,
    user:{
        id:string,
        name?:string,
        phone:string,
        role:"PLAYER" |"ADMIN",
    },
    message:string,
    success:boolean
}

export type RegisterRequest={
    firstName:string,
    lastName:string,
    phoneNumber:string
}

