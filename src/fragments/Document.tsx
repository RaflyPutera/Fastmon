import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"


interface DocumentProps{
    id:number,
    name:string,
}

export function Document({id,name}:DocumentProps){
    const [isChecked, setIsChecked] = useState(false);
    const handleCheck = (checked:boolean)=>{
        setIsChecked(checked)
        console.log(checked)
    }
    return(
        <>
        <div className="flex items-center space-x-2">
            <Checkbox checked={isChecked} onCheckedChange={handleCheck} className="ml-2" key={id} />
            <Button variant="ghost" className="w-full rounded-none">
                {name}
            </Button>
        </div>
        <Separator/>
        </>
    )

}