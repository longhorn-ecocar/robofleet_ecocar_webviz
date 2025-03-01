// useRobofleetMsgPublisher.ts
import { useContext, useCallback } from 'react';
import { flatbuffers } from 'flatbuffers';
import WebSocketContext from '../contexts/WebSocketContext';
import { fb } from '../schema';

/**
 * A generic publisher hook for sending any ROS message via Robofleet.
 *
 * The returned publishMessage function takes:
 * - topic: The ROS topic where the message should be published.
 * - messageType: A string representing the message type.
 * - buildPayload: A callback that accepts a flatbuffers.Builder and returns
 *                 the offset of the payload message. This allows you to build any message type.
 *
 * The hook constructs the message metadata, uses your payload builder, wraps the payload
 * in a MsgWithMetadata envelope, and sends it over the WebSocket.
 *
 * @returns A function to publish a message.
 */
export default function useRobofleetMsgPublisher() {
    const ws = useContext(WebSocketContext);
    if (!ws) throw new Error('No WebSocketContext provided.');

    const publishMessage = useCallback(
        (
            topic: string,
            messageType: string,
            buildPayload: (builder: flatbuffers.Builder) => number
        ) => {
            const fbb = new flatbuffers.Builder();

            // Create metadata strings.
            const topicOffset = fbb.createString(topic);
            const typeOffset = fbb.createString(messageType);

            // Build the metadata for the message.
            const metadataOffset = fb.MsgMetadata.createMsgMetadata(fbb, typeOffset, topicOffset);

            // Let the caller build the payload for their specific message type.
            const payloadOffset = buildPayload(fbb);

            // Wrap the payload in a MsgWithMetadata envelope.
            const msgWithMetadataOffset = fb.MsgWithMetadata.createMsgWithMetadata(
                fbb,
                metadataOffset,
                fb.PayloadType.ByteMultiArray as unknown as fb.Payload,
                payloadOffset
            );

            // Finalize the flatbuffer.
            fbb.finish(msgWithMetadataOffset);

            // Publish the message over the WebSocket.
            ws.ws?.send(fbb.asUint8Array());
        },
        [ws]
    );

    return publishMessage;
}
