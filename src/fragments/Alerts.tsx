import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,} from "@/components/ui/alert-dialog"

interface CardAlertProps {
    active:boolean;
    setActive:React.Dispatch<React.SetStateAction<boolean>>
    fx:()=>void;
    title: string;
    description: string;
}

export function CardAlert({setActive,active,fx,title,description}:CardAlertProps){
    return(
        <AlertDialog open={active}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>
                    {description}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={()=>{setActive(false)}}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={fx}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>   
    )
}