import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"


interface DocumentProps{
    id:string,
    name:string,
    setActiveDocument:(id:string)=>void
}

export function Document({id,name, setActiveDocument}:DocumentProps){
    const [isChecked, setIsChecked] = useState(false);
    const handleCheck = (checked:boolean)=>{
        setIsChecked(checked)
        console.log(checked)
    }
    const handleClick = () => {
        setActiveDocument(id);  // Set the active document by id
        console.log('Active document id:', id);
    };

    return(
        <>
        <div className="flex items-center space-x-2">
            <Checkbox checked={isChecked} onCheckedChange={handleCheck} className="ml-2" key={id} />
            <Button variant="ghost" className="w-full rounded-none" onClick={handleClick}>
                {name}
            </Button>
        </div>
        <Separator/>
        </>
    )

}