

export type AuthResponse={
    token:string;
    user:{
        id:string,
        name?:string,
        phone:string,
        role:"PLAYER" |"ADMIN",
    },
    success:boolean
}

export type RegisterRequest={
    firstName:string,
    lastName:string,
    phoneNumber:string
}

