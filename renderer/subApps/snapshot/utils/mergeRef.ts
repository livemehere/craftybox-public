export const mergeRef = (...refs: React.Ref<any>[]) => {
    return (el: any) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(el);
            } else if (ref) {
                ref.current = el;
            }
        });
    };
};