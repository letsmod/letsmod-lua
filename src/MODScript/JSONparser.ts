import { ActionFactory } from "./FactoryClasses/ActionsFactory";
import { ActionDefinition, CATs, ConditionDefinition, EventDefinition, TriggerDefinition, Vector3 } from "./MODscriptDefs";

export class JSONparser {
    static parseEventDefinitions(jsonString: string): EventDefinition[] {
        const eventStrings = this.splitEvents(jsonString.trim().slice(1, -1));
        return eventStrings.map(eventStr => this.parseSingleEvent(eventStr));
    }

    static splitEvents(jsonString: string): string[] {
        const events = [];
        let braceCount = 0;
        let startIndex = 0;

        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString[i];
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    // Complete event object found
                    const eventString = jsonString.substring(startIndex, i + 1).trim();
                    events.push(eventString);

                    // Skip over any commas and whitespace following the current event object
                    while (jsonString[i + 1] === ',' || jsonString[i + 1] === ' ') {
                        i++;
                    }
                    startIndex = i + 1;
                }
            }
        }

        return events;
    }

    static parseSingleEvent(eventStr: string): EventDefinition {
        const x = {
            id: this.parseNumberValue(eventStr, 'id'),
            order: this.parseNumberValue(eventStr, 'order'),
            actorName: this.parseStringValue(eventStr, 'actorName'),
            actorType: this.parseStringValue(eventStr, 'actorType'),
            trigger: this.parseTriggerDefinition(eventStr),
            action: this.parseActionDefinition(eventStr),
            repeatable: this.parseBooleanValue(eventStr, 'repeatable'),
            enabled: this.parseBooleanValue(eventStr, 'enabled')
        };

        return x;
    }

    static parseTriggerDefinition(eventStr: string): TriggerDefinition {
        const triggerStr = this.getStringBetween(eventStr, '"trigger":{', '},');
        return {
            triggerType: this.parseStringValue(triggerStr, 'triggerType'),
            args: this.parseTriggerArgs(triggerStr)
        };
    }

    static parseConditionDefinition(conditionStr: string): ConditionDefinition {
        return {
            conditionType: this.parseStringValue(conditionStr, 'conditionType'),
            args: this.parseConditionArgs(conditionStr)
        };
    }

    static parseActionDefinition(eventStr: string, subActionStr?: string): ActionDefinition {
        
        const actionStr = subActionStr?subActionStr:this.getStringBetween(eventStr, '"action":{', '},');
        return {
            actionType: this.parseStringValue(actionStr, 'actionType'),
            args: this.parseActionArgs(actionStr)
        };
    }

    static parseTriggerArgs(triggerStr: string): { [key: string]: number | ConditionDefinition } {

        let argsString = this.getStringBetween(triggerStr, '{', '}');

        const keyValues = argsString.split(',').map(kv => kv.split(':').map(s => s.trim()));
        let args: { [key: string]: number | ConditionDefinition } = {}

        for (const [key, value] of keyValues) {
            if (key.includes("maxDistance"))
                args.maxDistance = Number(value);
            else if (key.includes("eventId"))
                args.eventId = Number(value);

            if (key.includes("condition")) {
                const conditionStr = this.getStringBetween(argsString, '{', '}');
                args.condition = this.parseConditionDefinition(conditionStr);
            }
        }
        return args;
    }

    static parseConditionArgs(conditionStr: string): { [key: string]: number | Vector3 | ConditionDefinition | string } {
        let argsString = this.getStringBetween(conditionStr, '{', '}');

        const keyValues = argsString.split(',').map(kv => kv.split(':').map(s => s.trim()));
        let args: { [key: string]: number | Vector3 | ConditionDefinition | string } = {}

        for (const [key, value] of keyValues) {
            if (key.includes("elementId"))
                args.elementId = value;
            else if (key.includes("tagId"))
                args.tagId = value.split('"').join('');
            else if (key.includes("maxDistance"))
                args.maxDistance = value;
            else if (key.includes("teamId"))
                args.teamId = Number(value);
            else if (key.includes("minMass"))
                args.minMass = Number(value);
            else if (key.includes("maxMass"))
                args.maxMass = Number(value);
            else if (key.includes("minSize"))
                args.minSize = Number(value);
            else if (key.includes("maxSize"))
                args.maxSize = Number(value);
            else if (key.includes("actorId"))
                args.actorId = Number(value);
            else if (key.includes("actorName")) {
                args.actorName = value.split('"').join('')
                //HACK: This should be temporary.
                if (args.actorName === "Player")
                    args.actorName = "Adventurer";
            }
            else if (key.includes("condition1"))
                 args.condition1 = this.parseConditionDefinition(this.getStringBetween(argsString, '{', '}'));
            else if (key.includes("condition2"))
                 args.condition2 = this.parseConditionDefinition(this.getStringBetween(argsString, '{', '}'));
            else if (key.includes("condition"))
                 args.condition = this.parseConditionDefinition(this.getStringBetween(argsString, '{', '}'));                
        }
        return args;
    }

    static parseActionArgs(actionStr: string): { [key: string]: number | string | ActionDefinition } {
        let argsString = this.getStringBetween(actionStr, '{', '}');

        const keyValues = argsString.split(',').map(kv => kv.split(':').map(s => s.trim()));
        let args: { [key: string]: number | string | ActionDefinition } = {}

        for (const [key, value] of keyValues) {
            if (key.includes("actorName")) {
                args.actorName = value.split('"').join('');
                //HACK: This should be temporary.
                if (args.actorName === "Player")
                    args.actorName = "Adventurer";
            }
            else if (key.includes("actorId"))
                args.actorId = Number(value);
            else if (key.includes("sentence"))
                args.sentence = value;
            else if (key.includes("speakId"))
                args.speakId = value;
            else if (key.includes("audioId"))
                args.audioId = value.replace('https','https:');
            else if(key.includes("image"))
                args.image = value.replace('https','https:');
            else if (key.includes("duration"))
                args.durationMs = Number(value);
            else if (key.includes("audioGapMs"))
                args.durationMs = Number(value);
            else if (key.includes("prefabId"))
                args.prefabId = Number(value);
            else if (key.includes("prefabName"))
                args.prefabId = value;
            else if (key.includes("timeToWait"))
                args.timeToWait = Number(value);
            else if (key.includes("eventId"))
                args.eventId = Number(value);
            else if (key.includes("stateId"))
                args.stateId = Number(value);
            else if (key.includes("action1"))
                args.action1 = this.parseActionDefinition("",this.getStringBetween(actionStr, '"action1":{', '}'));
            else if (key.includes("action2"))
                args.action2 = this.parseActionDefinition("",this.getStringBetween(actionStr, '"action2":{', '}'));           

        }
        return args;
    }

    static parseNumberValue(str: string, key: string): number {
        const value = this.findValueForKey(str, key);
        return value !== null ? parseInt(value, 10) : 0; // or handle error
    }

    static parseStringValue(str: string, key: string): string {
        const value = this.findValueForKey(str, key);
        return value !== null ? value.split('"').join('') : '';
    }

    static parseBooleanValue(str: string, key: string): boolean {
        const value = this.findValueForKey(str, key)?.replace("}", "");
        return value === 'true';
    }

    static findValueForKey(str: string, key: string): string | null {
        const keyIndex = str.indexOf(`"${key}"`);
        if (keyIndex === -1) return null;

        let startIndex = str.indexOf(':', keyIndex) + 1;
        let endIndex = str.indexOf(',', startIndex);
        if (endIndex === -1) endIndex = str.length;

        return str.substring(startIndex, endIndex).trim();
    }


    static getStringBetween(str: string, start: string, end: string): string {
        let startIndex = str.indexOf(start);
        if (startIndex === -1) return '';
        startIndex += start.length;

        let braceCount = 0;
        let endIndex = startIndex;

        while (endIndex < str.length) {
            if (str[endIndex] === '{') {
                braceCount++;
            } else if (str[endIndex] === '}') {
                if (braceCount === 0) {
                    break;
                }
                braceCount--;
            }
            endIndex++;
        }

        return endIndex < str.length ? str.slice(startIndex, endIndex).trim() : '';
    }
}